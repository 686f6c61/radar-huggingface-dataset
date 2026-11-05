# fiore-lab/GLM-5.3-EXL3-Base

## Resumen

GLM-5.3-EXL3-Base es una distribución parcial de pesos del modelo GLM-5.3 de Z.AI (zai-org), publicada por fiore-lab. No es un modelo independiente ni una cuantización completa: contiene todos los componentes de GLM-5.3 (755B parámetros totales, arquitectura `glm_moe_dsa`) excepto los expertos enrutados de las capas 3 a 77, que se sirven desde un repositorio separado de bancos de expertos en 3 bits. El repositorio ocupa 21,2 GB y está diseñado exclusivamente para el motor de inferencia ExpertAtlas-GLM5.3 (release r3.3-102 o posterior) sobre clústeres NVIDIA DGX Spark.

La relevancia de esta publicación es práctica: permite desplegar un modelo MoE de 755B en configuraciones de 4 u 8 nodos DGX Spark con un total de 299,1 GB de disco por nodo, combinando este repositorio con el banco de expertos de 3 bits. Los pesos no expertos se cuantizan en EXL3 a 5 bits (codebook mul1), mientras que embeddings, `lm_head`, normas, router, `kv_b_proj` y componentes del indexador se conservan en BF16 byte a byte respecto al checkpoint oficial.

El modelo base GLM-5.3 es un transformer MoE con atención dispersa (DSA, *DeepSeek-style attention* según el identificador de arquitectura `glm_moe_dsa`) e incluye una capa MTP (multi-token prediction) en la capa 78, que esta distribución usa como drafter por defecto para decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (transformer MoE con atención dispersa y capa MTP) |
| Parametros totales | 755B (modelo base); 10.597.330.304 en los safetensors de este repo (sin expertos enrutados de capas 3-77) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 5 bits (codebook mul1) en lineales no expertos; BF16 en embeddings, `lm_head`, normas, router, `kv_b_proj` e indexador; expertos enrutados en bancos de 3 bits (repo separado); expertos de la capa MTP en 4 bits mcg |
| Idiomas soportados | no disponible (la model card incluye versiones en inglés, japonés y chino simplificado) |
| Licencia | GLM-5.3 License (Copyright 2026 Z.AI) |
| Formato de pesos | safetensors (5 archivos `.safetensors` + índice `model.safetensors.index.json` con 6.014 tensores) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) con atención dispersa, identificado en el `config.json` como `glm_moe_dsa`. La distribución de fiore-lab separa los pesos en tres bloques: lineales no expertos de las capas 0-77 en EXL3 de 5 bits (proyecciones de atención, expertos compartidos, MLP denso de las capas 0-2 y `wq_b` del indexador); tensores en BF16 sin cuantizar (embeddings, `lm_head`, normas, router, `kv_b_proj`, `wk`/`weights_proj`/`k_norm` del indexador y norma final); y la capa MTP (capa 78) con expertos enrutados en 4 bits mcg y lineales en 5 bits mul1.

No se ha vuelto a cuantizar nada: los archivos se generan con la herramienta `assemble.py base` de la receta ExpertAtlas-GLM5.3 a partir del checkpoint de cuatro nodos, y pueden reproducirse desde `zai-org/GLM-5.3-BF16` (revisión `9d2398f`) sin descargar este repositorio. La innovación técnica destacable es la separación entre pesos residentes (no expertos) y bancos de expertos enrutados, lo que permite al motor leer cada experto desde disco con el ancho de bits elegido experto a experto. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base.

## Capacidades

- Generación de texto y razonamiento general heredados de GLM-5.3 (755B parámetros totales).
- Capacidad MoE con expertos enrutados servidos dinámicamente desde bancos en disco.
- Decodificación especulativa mediante la capa MTP (capa 78) incluida como drafter por defecto.
- Ejecución distribuida en clústeres de 4 u 8 nodos DGX Spark con 299,1 GB de disco por nodo.
- Verificación de integridad de descarga mediante `SHA256SUMS`.
- Capacidades específicas de tool calling, agentes, visión o multilingüismo del modelo base: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue de GLM-5.3 en infraestructura DGX Spark: el repositorio está empaquetado exclusivamente para el motor ExpertAtlas-GLM5.3 (r3.3-102+), de modo que un equipo con 4 u 8 nodos DGX Spark puede servir el modelo sin necesidad de GPUs de centro de datos convencionales.
- Investigación sobre cuantización MoE selectiva: permite estudiar el impacto de mantener router, normas y embeddings en BF16 mientras los lineales no expertos van en EXL3 de 5 bits y los expertos enrutados en 3 bits.
- Reproducibilidad de pipelines de pesos: la receta `assemble.py base` y la documentación en `glm53/weights` permiten regenerar cada archivo desde el checkpoint BF16 oficial, útil para auditorías de integridad.
- Evaluación de decodificación especulativa con MTP: la capa 78 se incluye como drafter por defecto, lo que facilita medir aceleraciones de decodificación en entornos multi-nodo.
- Servicio de inferencia a gran escala con requisitos de disco acotados: 21,2 GB para pesos no expertos más el banco de 3 bits, en lugar de descargar los checkpoints completos de 4 u 8 nodos.
- Benchmarking de motores de inferencia especializados: sirve como carga de trabajo de referencia para comparar el motor ExpertAtlas frente a otras soluciones de serving MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM: no disponible de forma explícita; el modelo base tiene 755B parámetros y esta distribución requiere, junto con el banco de expertos de 3 bits, 299,1 GB de disco por nodo.
- GPU recomendadas: NVIDIA DGX Spark (plataforma objetivo del motor ExpertAtlas-GLM5.3). No se documenta soporte para A100, H100 ni RTX 4090.
- Configuración mínima: 4 nodos DGX Spark; configuración de referencia: 8 nodos DGX Spark.
- No cabe en GPU de consumo convencional según la información disponible.
- Opciones de despliegue: exclusivamente el motor ExpertAtlas-GLM5.3 (release r3.3-102 o posterior). No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-EXL3-Base (esta ficha) | 755B totales (10,6B en safetensors no expertos) | no disponible | safetensors EXL3/BF16 + bancos de expertos | GLM-5.3 License | HuggingFace, 0 descargas |
| zai-org/GLM-5.3 | 755B | no disponible | safetensors (oficial) | GLM-5.3 License | HuggingFace (oficial) |
| fiore-lab/GLM-5.3-EXL3-8x-DGX-Sparks | 755B (checkpoint completo) | no disponible | safetensors EXL3 | GLM-5.3 License | HuggingFace |
| fiore-lab/GLM-5.3-EXL3-4x-DGX-Sparks | 755B (checkpoint completo) | no disponible | safetensors EXL3 | GLM-5.3 License | HuggingFace |

## Limitaciones y advertencias

- No es un modelo autónomo: requiere obligatoriamente el repositorio `fiore-lab/GLM-5.3-EXL3-Experts-3bit` (299,1 GB por nodo en total) y el motor ExpertAtlas-GLM5.3 r3.3-102 o posterior; ningún otro motor puede cargar estos archivos.
- No contiene los expertos enrutados de las capas 3 a 77; sin el banco de expertos el modelo es inutilizable.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria documentada.
- Licencia GLM-5.3 con cláusula de revisión de seguridad de Z.AI para entidades con ingresos agregados superiores a 10.000 millones de USD en 12 meses consecutivos que operen un negocio de Modelo como Servicio; es necesario verificar su aplicabilidad antes de uso comercial.
- El código de la receta es Apache-2.0 y se licencia por separado de los pesos.
- Sesgos, riesgo de alucinación y limitaciones idiomáticas del modelo base: no disponibles en la información proporcionada.
- La cuantización EXL3 de 5 bits en lineales no expertos y de 3 bits en expertos enrutados puede degradar la calidad respecto al checkpoint BF16; no se aportan métricas de dicha degradación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fiore-lab/GLM-5.3-EXL3-Base
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Checkpoint BF16 del modelo base: https://huggingface.co/zai-org/GLM-5.3-BF16
- Banco de expertos 3 bits: https://huggingface.co/fiore-lab/GLM-5.3-EXL3-Experts-3bit
- Checkpoint completo 8 nodos: https://huggingface.co/fiore-lab/GLM-5.3-EXL3-8x-DGX-Sparks
- Checkpoint completo 4 nodos: https://huggingface.co/fiore-lab/GLM-5.3-EXL3-4x-DGX-Sparks
- Receta ExpertAtlas-GLM5.3: https://github.com/fiore-labo/ExpertAtlas-GLM5.3
- Documentación de herramientas de pesos: https://github.com/fiore-labo/ExpertAtlas-GLM5.3/blob/main/glm53/weights/README.md

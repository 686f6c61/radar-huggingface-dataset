# LuminoLex/LuminoLex-1.7B

## Resumen

LuminoLex-1.7B es un modelo de lenguaje causal de tipo Mixture-of-Experts (MoE) disperso desarrollado por LuminoLex AI. Tiene 1.699.863.296 parámetros totales, de los cuales solo 0,41B se activan por token, lo que le permite ofrecer la capacidad de un modelo mayor con un coste de inferencia propio de uno mucho más pequeno. La arquitectura combina 20 capas decoder con enrutamiento latente de expertos en un espacio compacto de 512 dimensiones y atencion con consultas agrupadas (GQA).

El modelo se distribuye en BF16 (aproximadamente 3,4 GB de pesos) y esta pensado para ejecutarse en una unica GPU de consumo. Se publica bajo licencia Apache 2.0, lo que facilita su uso comercial, y esta entrenado unicamente en ingles. La longitud de contexto es de solo 1.024 tokens, una cifra muy limitada en comparacion con los estandares actuales.

Su relevancia actual radica en el interes por arquitecturas MoE eficientes en el extremo mas pequeno del espectro: maximizar capacidad mediante expertos dispersos manteniendo un coste de activacion bajo. No obstante, conviene tener en cuenta que no se han publicado resultados de benchmarks ni detalles del corpus de entrenamiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal con Mixture-of-Experts disperso (MoE) |
| Parametros totales | 1.699.863.296 (1,7B) |
| Parametros activos | 0,41B por token |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, requiere trust_remote_code / custom_code) |

Detalles arquitectonicos adicionales declarados por el autor:

| Parametro | Valor |
|---|---|
| Capas decoder | 20 |
| Hidden size | 1.536 |
| Tamano de vocabulario | 32.800 |
| Cabezas de atencion (query) | 24 |
| Cabezas clave/valor | 8 |
| Dimension de cabeza | 64 |
| Expertos enrutados | 64 |
| Expertos activos por token | 6 |
| Experto compartido por capa | Si |
| Dimension latente del MoE | 512 |
| Tamano intermedio de experto | 1.086 |
| Precision de pesos | BF16 |

## Arquitectura y entrenamiento

LuminoLex-1.7B es un transformer decoder causal con capas de Mixture-of-Experts disperso. Cada capa incorpora 64 expertos enrutados de los que se activan 6 por token, ademas de un experto compartido presente en todas las capas. Los expertos operan en un espacio latente compacto de 512 dimensiones, un diseno que reduce el coste de las proyecciones asociadas al enrutamiento. La atencion usa grouped-query attention con 24 cabezas de consulta y 8 cabezas clave/valor de dimension 64, lo que reduce el tamano de la cache KV frente a atencion multi-cabeza clasica.

El modelo tiene 20 capas, hidden size de 1.536 y un vocabulario de 32.800 tokens, con pesos en BF16. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de ajuste como RLHF, DPO o SFT. Tampoco se documentan innovaciones adicionales de decodificacion (por ejemplo, decodificacion especulativa) ni mecanismos de atencion alternativos: el autor solo menciona el diseno MoE disperso y el enrutamiento latente como rasgos distintivos.

## Capacidades

- Generacion de texto causal y conversacion multi-turno, segun el `pipeline_tag` de text-generation y la etiqueta conversational.
- Razonamiento basico y respuesta a preguntas en ingles (el ejemplo oficial de la model card resuelve una pregunta factual simple).
- Capacidad de "conocimiento condicional" derivada del diseno MoE: mayor numero de parametros totales que activos, lo que aporta capacidad de almacenamiento con coste de computo reducido.
- Soporte de tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona).
- Capacidades multilingues: limitadas al ingles; no se declaran otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Carga e inferencia mediante `transformers` con `trust_remote_code=True` por el uso de codigo personalizado (custom_code).

## Casos de uso

- Prototipado y pruebas de concepto en local: al ocupar aproximadamente 3,4 GB en BF16 y caber en una GPU de consumo, permite experimentar con una arquitectura MoE real sin infraestructura dedicada.
- Generacion de texto corto en ingles: resumenes breves, reescritura de frases o generacion de respuestas para formularios, dentro del limite de 1.024 tokens de contexto.
- Asistentes conversacionales simples: el modelo esta etiquetado como conversational y soporta dialogos multi-turno, siempre que la conversacion completa quepa en la ventana de contexto.
- Investigacion sobre enrutamiento de expertos: su configuracion (64 expertos, 6 activos, espacio latente de 512 dimensiones, experto compartido) lo convierte en un banco de pruebas para estudiar politicas de enrutamiento y balanceo de carga.
- Educacion y experimentacion academica: util para ensenar conceptos de MoE y GQA con un modelo de tamano manejable y licencia permisiva.
- Fine-tuning ligero sobre dominio especifico: al ser Apache 2.0 y con 1,7B de parametros totales, es viable ajustarlo en una GPU unica para tareas concretas en ingles (por ejemplo, clasificacion generativa o extraccion de campos).
- Despliegue en el borde o entornos con recursos limitados: el bajo numero de parametros activos (0,41B) reduce el coste por token frente a un modelo denso de capacidad similar.

Nota: no se documentan casos de uso oficiales en la model card; los anteriores son aplicaciones razonables a partir de las caracteristicas tecnicas, no recomendaciones del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 3,4 GB solo de pesos, mas overhead de activaciones y cache KV. Como referencia, la cache KV con contexto de 1.024 tokens y GQA de 8 cabezas por capa es muy pequena (del orden de decenas de MB), por lo que un presupuesto de 4 a 6 GB de VRAM es realista (estimacion propia, no confirmada por el autor).
- Cuantizacion: no se publican pesos cuantizados; al no existir versiones GGUF/AWQ/GPTQ oficiales, la reduccion de memoria requeriria una conversion propia.
- GPU recomendadas: cabe en GPU de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090. En el extremo profesional, A100, H100 o L40S lo ejecutan con holgura, aunque estan sobredimensionadas para este tamano.
- Caber en GPU de consumo: si, en cualquier GPU con 6 GB o mas de VRAM en BF16.
- Opciones de despliegue: `transformers` es el soporte declarado (con `trust_remote_code=True`). Otros runners (vLLM, llama.cpp, Ollama, TGI) no estan confirmados en la informacion disponible y dependerian de que se implemente el codigo personalizado del modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Comparativa orientativa con otras arquitecturas MoE de tamano reducido. Los datos de los modelos alternativos corresponden a informacion publica de sus respectivas fichas, no a la informacion proporcionada para LuminoLex.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LuminoLex-1.7B | 1,7B | 0,41B | 1.024 | Apache 2.0 | HuggingFace |
| OLMoE-1B-7B | 7B | 1B | 4.096 | Apache 2.0 | HuggingFace |
| Qwen1.5-MoE-A2.7B | 14,3B | 2,7B | 32.768 | Licencia Qwen | HuggingFace |

Observaciones: LuminoLex-1.7B es notablemente mas pequeno en parametros totales que las alternativas MoE citadas, pero su ventana de contexto (1.024 tokens) es entre 4 y 32 veces menor. No hay datos de rendimiento publicados para LuminoLex-1.7B, por lo que no es posible comparar calidad. No se dispone de datos de throughput ni de latencia para ninguno de los modelos en este contexto.

## Limitaciones y advertencias

- Contexto muy corto: 1.024 tokens, insuficiente para documentos largos, bases de codigo, resumenes extensos o conversaciones prolongadas.
- Solo ingles: no hay soporte declarado para castellano ni otros idiomas; el rendimiento fuera del ingles no esta garantizado.
- Ausencia de benchmarks: no se han publicado resultados de evaluacion, por lo que no se puede verificar la calidad ni compararla con alternativas.
- Falta de transparencia en el entrenamiento: no se documentan tokens de entrenamiento, composicion del dataset, filtrado ni tecnicas de alineacion (RLHF/DPO). Esto dificulta evaluar sesgos y riesgos.
- Riesgo de alucinacion: inherente a los modelos generativos; sin datos de evaluacion de factualidad, debe asumirse un riesgo no cuantificado.
- Sesgos conocidos: no disponibles, pero al no publicarse la composicion del corpus no es posible descartar sesgos derivados de los datos.
- Licencia: Apache 2.0, permisiva para uso comercial, siempre que se conserven los avisos de licencia y atribucion.
- Requiere `trust_remote_code=True`: implica ejecutar codigo personalizado del repositorio, lo que anade un riesgo de seguridad que conviene auditar antes de desplegarlo en produccion.
- Madurez del modelo: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin senales de adopcion ni de mantenimiento por parte de la comunidad.
- Cuantizaciones no oficiales: no hay versiones GGUF, AWQ o GPTQ publicadas, lo que limita el despliegue en entornos con poca memoria sin trabajo adicional de conversion.
- Modo de ejemplo: la model card usa un formato de prompt simple ("User: ...\nAssistant:"), sin documentar una plantilla de chat oficial, lo que puede degradar la calidad conversacional si el formato no coincide con el de entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/LuminoLex/LuminoLex-1.7B
- Paper: no disponible
- Repositorio de codigo: no disponible
- Blog o anuncio: no disponible
- Demo: no disponible

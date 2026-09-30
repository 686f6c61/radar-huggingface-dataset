# mdagosta/waldito-python-basics-v1-r0000-all-mdagosta

## Resumen

El modelo `mdagosta/waldito-python-basics-v1-r0000-all-mdagosta` es una exportación de un modelo de lenguaje causal de la familia OpenWALDO, publicada por el usuario mdagosta en HuggingFace. Se trata de un modelo pequeno (9.541.632 parámetros según los pesos en safetensors) construido sobre la arquitectura estándar Llama de Transformers, orientado a generación de texto y conversación. El identificador sugiere que es la revisión base (`r0000`) de una serie enfocada a "python-basics", es decir, a contenidos introductorios de programación en Python.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el repositorio no tiene descargas ni likes, el tamano del repo aparece como 0.0 GB y no se declaran benchmarks, licencia ni idiomas soportados. La model card es extremadamente breve y se limita a indicar que usa la arquitectura Llama causal estándar con el tokenizer de bytes "schema-1" de OpenWALDO y que requiere `trust_remote_code=True` para cargar el tokenizer.

Por tanto, esta ficha recoge únicamente los datos verificables disponibles (arquitectura, número de parámetros y naturaleza del tokenizer) y marca explícitamente como "no disponible" todo aquello que el autor no ha publicado. Cualquier evaluacion en produccion deberia hacerse tras inspeccionar directamente los archivos del repositorio (`BOM.json` y `EU-BOM.json`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama (arquitectura estándar de Transformers) |
| Parametros totales | 9.541.632 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Según la model card, el modelo emplea "the standard Transformers Llama causal-language-model architecture", es decir, un transformer causal con la disposición de capas, atención y FFN habitual de la familia Llama. Sobre esa base se sustituye el tokenizer convencional por el tokenizer de bytes "schema-1" propio del proyecto OpenWALDO, que debe cargarse con `trust_remote_code=True`, lo que implica que el repositorio incluye código personalizado para el preprocesado. El nombre "byte tokenizer" apunta a un esquema de tokenizacion a nivel de byte, sin vocabulario subword clásico, aunque no se detalla su tamano de vocabulario ni su comportamiento.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Tampoco se documentan innovaciones técnicas (decodificación especulativa, atención lineal, etc.). El autor publica un `BOM.json` con el inventario de archivos de la release y un `EU-BOM.json` con el mapeo de divulgación de contenido de entrenamiento exigido por el reglamento europeo de IA (GPAI); estos archivos son la fuente indicada para verificar procedencia y composición, pero su contenido no se ha incluido en la información disponible.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`, con soporte para modo conversacional según los tags del repositorio.
- Conversación multi-turno: etiquetado como `conversational`, aunque no se especifica el formato de plantilla de chat.
- Carga mediante Transformers: compatible con la librería `transformers` y con `text-generation-inference` (tags `text-generation-inference` y `endpoints_compatible`).
- Tokenizacion de bytes: usa el tokenizer "schema-1" de OpenWALDO, lo que puede afectar al manejo de texto no ASCII y requiere código remoto.
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (modo pensamiento, visión, audio): no disponible.

## Casos de uso

- Experimentacion educativa con Python: dado el identificador "python-basics", el modelo parece pensado para practicar la generacion de fragmentos simples de código o ejemplos introductorios; su tamano reducido lo hace adecuado para entornos de aprendizaje y pruebas, no para producción crítica.
- Pruebas de integracion con el ecosistema Transformers: sirve para validar pipelines de carga con `trust_remote_code=True` y el tokenizer de bytes de OpenWALDO antes de escalar a modelos mayores de la misma familia.
- Prototipado de endpoints compatibles: al estar etiquetado como `endpoints_compatible` y `text-generation-inference`, puede desplegarse en un TGI local para probar contratos de API de generación de texto.
- Investigacion sobre tokenizacion a nivel de byte: útil para estudiar cómo se comporta un modelo Llama pequeño cuando se le acopla un tokenizer de bytes en lugar de un vocabulario subword.
- Generacion de texto de bajo coste en hardware muy limitado: con 9.5M parámetros, cabe en CPU y en GPUs de gama baja para demostraciones o tests automatizados.
- Reproducibilidad de releases con BOM: el uso de `BOM.json` y `EU-BOM.json` permite auditar la composición de la release, lo que encaja en flujos de cumplimiento y trazabilidad de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9.541.632 parámetros, los pesos en fp32 ocupan aproximadamente 38 MB y en fp16 unos 19 MB; el consumo real de VRAM será mayor por el estado de atención, el tokenizer de bytes y los buffers de runtime, pero en cualquier caso muy bajo.
- GPU recomendadas: cualquier GPU moderna es sobradamente suficiente (RTX 3060, RTX 4090, A100, H100); tambien es viable en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo e incluso en CPU.
- Opciones de despliegue: Transformers, text-generation-inference (TGI) y, en principio, formatos derivados si se convierten los pesos; no se confirma compatibilidad con llama.cpp, Ollama o vLLM (no disponible).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| waldito-python-basics-v1-r0000-all-mdagosta | 9.541.632 | no disponible | no disponible | HuggingFace |
| waldito-python-basics-v1-r0000-merge | no disponible | no disponible | no disponible | HuggingFace |
| Modelos Llama de referencia (p. ej. Llama 3.2 1B) | ~1.000 millones | hasta 128K | licencia Llama | HuggingFace |

Nota: el modelo comparable mas directo es la variante `merge` del mismo autor, de la que no se dispone de especificaciones. Frente a modelos Llama de mayor tamano, este modelo es aproximadamente dos ordenes de magnitud menor en parámetros y no publica métricas que permitan comparar rendimiento. No se dispone de datos de benchmarks que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se documenta la composicion del dataset ni medidas de mitigacion.
- Riesgo de alucinacion: elevado en terminos relativos por el tamano reducido del modelo (9.5M parámetros) y la ausencia de datos de evaluacion.
- Limitaciones de contexto o idioma: se desconoce la longitud de contexto y los idiomas soportados; no se declara ninguno.
- Restricciones de licencia: la licencia aparece como "no disponible", por lo que no se puede asumir uso comercial sin consultar al autor.
- Tokenizer de bytes: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; debe auditarse antes de usarlo en entornos de produccion.
- Ausencia de benchmarks: no hay ninguna metrica publicada que respalde calidad, precision o robustez.
- Madurez del repositorio: 0 descargas, 0 likes, tamano reportado de 0.0 GB y fechas de creacion y actualizacion separadas por 12 segundos, lo que sugiere una publicacion automatizada o experimental mas que un modelo validado.
- Fechas de creacion y actualizacion en 2026: verificar la consistencia temporal del repositorio antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mdagosta/waldito-python-basics-v1-r0000-all-mdagosta
- Variante merge del mismo autor: https://huggingface.co/mdagosta/waldito-python-basics-v1-r0000-merge
- Perfil de GitHub del autor: https://github.com/mdagosta

# AhmedPPL/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF

## Resumen

Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF es una versión "abliterated" (sin filtros de rechazo) del modelo Qwen3.8-Flash-Next de Qwen, publicada por AhmedPPL en colaboración con la comunidad huihui-ai. La abliteración es una técnica que modifica las direcciones de activación responsables de las negativas del modelo, eliminando los rechazos de seguridad sin necesidad de reentrenamiento. Esta segunda versión ajusta el énfasis de la abliteración y, a diferencia de la primera, no ablitera ninguno de los expertos del modelo MoE, lo que según el autor la hace más adecuada para escritura de novelas y programación.

El modelo base es un MoE de gran tamaño (176.943.899.520 parámetros totales según safetensors) con capacidades multimodales (pipeline image-text-to-text), razonamiento eficiente en tokens y entrenamiento post-training. La ficha se distribuye en formato GGUF cuantizado (serie unsloth UD-Q4_K_XL y Swift), con soporte para llama.cpp y el gestor Strata. Es relevante para usuarios que necesitan un modelo grande sin restricciones de contenido para investigación, escritura creativa o entornos controlados, aunque con advertencias explícitas de que no es apto para producción pública.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), multimodal (image-text-to-text) |
| Parametros totales | 176.943.899.520 (176,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (según el ejemplo de ejecución de llama.cpp) |
| Tipos de cuantizacion | GGUF UD-Q4_K_XL (con imatrix), serie unsloth y serie Swift (Swift-1.5); cuantizaciones adicionales no disponibles |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (other) |
| Formato de pesos | GGUF (repo de 952,7 GB); el modelo base original en safetensors |

## Arquitectura y entrenamiento

El modelo base, Qwen3.8-Flash-Next, es un modelo de la familia Qwen3 con arquitectura MoE, etiquetado con las técnicas GSQ, RCO, "efficient-thinking" y "token-efficient", lo que apunta a un entrenamiento post-training orientado a razonamiento con consumo eficiente de tokens de pensamiento. Es multimodal (image-text-to-text), aunque la ficha no detalla el número de expertos ni los parámetros activos por token. Los datos de entrenamiento (tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada.

La variante aquí descrita aplica abliteración sobre el modelo base, una técnica que identifica y neutraliza las direcciones en el espacio de activación que provocan rechazos, sin usar TransformerLens y sin reentrenamiento. En la versión 2 se recalibró la abliteración usando el corpus calibration3.txt para generar una matriz de importancia (imatrix_micro3.gguf) y producir la cuantización unsloth-UD-Q4_K_XL-V2, con una ligera reducción de la perplejidad (PPL). Importante: no se ablitera ningún experto del MoE, lo que preserva la calidad de los expertos y mejora el comportamiento en escritura y código.

## Capacidades

- Generacion de texto sin filtros de rechazo, orientada a escritura creativa (novelas) según el autor.
- Generacion y comprension de codigo, citada como caso de uso recomendado de esta versión.
- Razonamiento (reasoning) con pensamiento eficiente en tokens (efficient-thinking, token-efficient).
- Comprension de imagen y texto (pipeline image-text-to-text), heredada del modelo base.
- Ejecucion local mediante llama.cpp con contexto de hasta 262.144 tokens.
- Soporte para el gestor de descargas Strata con verificación SHA256 de la serie unsloth.
- No hay información sobre tool calling, function calling ni capacidades de agentes en la documentación disponible.

## Casos de uso

- Escritura de novela y ficcion larga: sin rechazos y sin expertos abliterados, el autor la recomienda explicitamente para escritura creativa; el contexto de 262.144 tokens permite mantener novelas extensas coherentes.
- Programacion asistida en entornos controlados: puede integrarse en editores locales (vía llama.cpp) para generar y refactorizar codigo sin restricciones de contenido.
- Investigacion en alineamiento y seguridad: al ser una versión abliterated, sirve como base para estudiar el comportamiento de modelos sin filtros y evaluar tecnicas de abliteración.
- Pruebas de cuantización con imatrix: la disponibilidad de imatrix y variantes UD-Q4_K_XL permite experimentar con calidad frente a tamaño en cuantización GGUF.
- Despliegue local privado de un modelo multimodal grande: para usuarios con hardware multi-GPU que necesiten procesar imagen y texto sin enviar datos a servicios externos.
- Validación de tooling (Strata y llama.cpp): el repo sirve como material de prueba para verificar descargas con SHA256 y compatibilidad de versiones de llama.cpp (probado con b11540).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica mencionada es una ligera disminución de la perplejidad (PPL) en la cuantización UD-Q4_K_XL-V2 respecto a la versión anterior, sin valores numéricos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; con cuantización Q4_K_XL sobre 176,9 B de parámetros, el peso del modelo ronda los 952,7 GB de repo (incluye múltiples variantes), por lo que la variante Q4_K_XL requiere del orden de cientos de GB de VRAM o RAM unificada; cifra precisa no disponible.
- GPU recomendadas: no disponible; por escala, se requieren configuraciones multi-GPU de gama datacenter (A100/H100 de 80 GB en varios nodos) o plataformas con memoria unificada de gran capacidad.
- Consumer GPU: no es viable en GPU de consumo estándar (RTX 4090 de 24 GB es insuficiente incluso con cuantización agresiva para este tamaño).
- Despliegue: llama.cpp (probado con la versión b11540, comando de ejemplo con -c 262144) y gestor de descargas Strata (con verificación SHA256 para la serie unsloth); no se menciona soporte de vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF | 176,9 B totales | MoE multimodal | 262.144 tokens | qwen-community-1.0 | GGUF (unsloth UD-Q4_K_XL, Swift) |
| Qwen/Qwen3.8-Flash-Next (base) | 176,9 B totales | MoE multimodal | 262.144 tokens (según esta ficha) | qwen-community-1.0 | safetensors y GGUF oficial (unsloth) |
| Huihui-Qwen3.8-Flash-Next-abliterated-GGUF (v1) | 176,9 B totales | MoE multimodal | 262.144 tokens | qwen-community-1.0 | GGUF, con expertos abliterados |

La diferencia clave frente a la v1 es que la v2 no ablitera expertos, lo que según el autor mejora la calidad en escritura y codigo, a costa de un filtrado de seguridad posiblemente menos agresivo.

## Limitaciones y advertencias

- Riesgo elevado de generar contenido sensible, controversial o inapropiado: el filtrado de seguridad está significativamente reducido por la abliteración.
- No apto para audiencias generales, menores de edad ni aplicaciones que exijan alta seguridad.
- Responsabilidad legal y etica recae en el usuario; el contenido generado puede conllevar riesgos legales.
- Recomendado solo para investigacion, pruebas o entornos controlados; no se aconseja su uso directo en produccion ni en aplicaciones comerciales públicas.
- Sin garantias de seguridad por defecto: el modelo no ha pasado por optimización de seguridad rigurosa y huihui.ai declina cualquier responsabilidad.
- Riesgo de alucinacion: no evaluado; no hay benchmarks publicados que cuantifiquen la fiabilidad.
- Idiomas soportados, parametros activos y rendimiento: no disponibles, lo que dificulta la planificación de despliegue.
- La licencia qwen-community-1.0 puede imponer restricciones de uso comercial; debe revisarse el texto de la licencia antes de cualquier despliegue comercial.
- El repo ocupa 952,7 GB, por lo que la descarga completa exige almacenamiento y ancho de banda considerables.

## Enlaces

- Ficha del modelo: https://huggingface.co/AhmedPPL/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Version anterior (v1): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-GGUF
- Cuantización unsloth-UD-Q4_K_XL-V2: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF/tree/main/unsloth-UD-Q4_K_XL-V2
- GGUF originales unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Serie Swift: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GGUF
- Repositorio de abliteración (remove-refusals-with-transformers): https://github.com/Sumandora/remove-refusals-with-transformers
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Release de llama.cpp usada en pruebas (b11540): https://github.com/ggml-org/llama.cpp/releases/tag/b11540
- Strata (gestor de descargas): https://github.com/Niko1221/Strata

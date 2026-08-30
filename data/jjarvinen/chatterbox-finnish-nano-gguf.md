# JJarvinen/chatterbox-finnish-nano-GGUF

## Resumen

Chatterbox Finnish Nano es una adaptación al finés del modelo de síntesis de voz (TTS) Chatterbox Nano, desarrollado originalmente por Resemble AI. Esta versión concreta, publicada por JJarvinen (Jussi Järvinen), es una conversión a formato GGUF del modelo safetensors `JJarvinen/chatterbox-finnish-nano` v0.1.3, pensada para ejecutarse con el runtime CrispASR/ggml. El modelo genera audio de voz en finés a partir de texto, con la particularidad de que puede funcionar sin necesidad de una voz de referencia (condicionamiento Nano integrado) o aceptando una grabación corta para imitar a un hablante concreto.

Con 180 millones de parámetros, es un modelo compacto diseñado para ejecutarse localmente, incluso en hardware modesto como una GPU integrada. Su relevancia radica en ofrecer una opción de TTS en finés de código abierto, con licencia MIT, que puede desplegarse en entornos sin conexión o con recursos limitados. La conversión GGUF no altera la arquitectura ni las capacidades del modelo original; solo cambia la representación numérica serializada para el runtime ggml.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Chatterbox de Resemble AI (no se especifica el tipo exacto de red en la informacion disponible) |
| Parametros totales | 180.323.862 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de texto a voz, no de lenguaje) |
| Tipos de cuantizacion | f16, q8_0, q4_k |
| Idiomas soportados | fi (fines) |
| Licencia | MIT |
| Formato de pesos | GGUF (tambien disponible safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es una adaptacion finesa de Chatterbox Nano, que a su vez forma parte de la familia Chatterbox de Resemble AI. Segun la model card, Chatterbox Nano utiliza los mismos componentes de generacion de audio (MeanFlow S3Gen, VE y condicionamiento) que Chatterbox Turbo, pero con pesos especificos para fines en el modulo T3. No se proporcionan detalles sobre el dataset de entrenamiento, el numero de tokens ni el proceso de optimizacion (RLHF, DPO, etc.). La conversion a GGUF se realizo con el script `models/convert-chatterbox-to-gguf.py --variant nano` del repositorio CrispASR, y las cuantizaciones q8_0 y q4_k se generaron con la herramienta `crispasr-quantize`, que preserva los tensores no cuantizables en su precision original.

## Capacidades

- Sintesis de voz en fines a partir de texto (hasta 600 caracteres por entrada, segun la demo).
- Generacion de voz sin referencia: utiliza el condicionamiento Nano incorporado, que permite producir habla con una voz por defecto sin necesidad de una grabacion de referencia.
- Condicionamiento opcional por voz de referencia: se puede subir una grabacion corta para que la voz sintetica se asemeje al hablante.
- Integracion con el runtime CrispASR/ggml, que permite ejecucion en CPU o GPU.
- No incluye capacidades de tool calling, agentes, vision ni otras funciones propias de modelos de lenguaje; es exclusivamente un modelo de texto a voz.

## Casos de uso

- Audiolibros y narracion en fines: el modelo puede convertir capitulos de texto en audio con una voz natural, ideal para producciones independientes o plataformas de audiolibros que necesiten soporte para fines.
- Asistentes de voz locales: al ser ligero y ejecutable en CPU, puede integrarse en asistentes personales o dispositivos embebidos que requieran respuestas habladas en fines sin depender de servicios en la nube.
- Accesibilidad para personas con discapacidad visual: lectores de pantalla en fines que convierten contenido digital en voz, funcionando completamente en local para proteger la privacidad.
- Doblaje y creacion de contenido multimedia: generacion de locuciones para videos, presentaciones o anuncios en fines, con la opcion de imitar una voz de referencia para mantener consistencia.
- Aprendizaje de idiomas: herramientas educativas que pronuncian texto fines de forma natural, ayudando a estudiantes a practicar comprension auditiva y pronunciacion.
- Sistemas de respuesta interactiva (IVR): menus telefonicos automatizados en fines, donde el modelo puede leer opciones o mensajes dinamicamente sin necesidad de grabaciones previamente almacenadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona que se realizaron pruebas de sintesis en CPU (smoke tests) para validar las tres variantes GGUF antes de su publicacion, pero no se ofrecen metricas objetivas de calidad de voz ni comparaciones con otros modelos.

## Requisitos de hardware

- Tamano de los archivos GGUF: f16 (453,7 MiB), q8_0 (329,2 MiB), q4_k (270,2 MiB). El modelo es ligero y cabe en cualquier GPU de consumo moderna, asi como en CPU.
- VRAM estimada: para la variante q4_k, menos de 300 MiB de VRAM; para f16, alrededor de 500 MiB. Puede ejecutarse incluso en GPUs integradas (el autor menciona haberlo probado en una GPU integrada AMD).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluyendo series NVIDIA GTX/RTX, AMD Radeon integradas o discretas, y Apple Silicon.
- Opciones de despliegue: el runtime principal es CrispASR (https://github.com/CrispStrobe/CrispASR), que soporta ejecucion en CPU y GPU. Tambien es posible usar llama.cpp u otros runtimes ggml, aunque la integracion oficial es via CrispASR.
- Latencia y throughput: no se proporcionan datos concretos. Dado el tamano del modelo, se espera una sintesis en tiempo real o cercana a tiempo real en hardware moderno, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos TTS en fines. Existen alternativas como Coqui TTS o Piper, pero no se han encontrado datos de rendimiento o calidad que permitan una comparacion objetiva con este modelo. Se recomienda evaluar directamente el audio generado para cada caso de uso especifico.

## Limitaciones y advertencias

- El modelo solo soporta fines; no es util para otros idiomas.
- No se han documentado sesgos especificos, pero al ser un modelo entrenado con datos limitados, puede presentar errores de pronunciacion en nombres propios, palabras extranjeras o jerga tecnica.
- Riesgo de alucinacion: en TTS, esto se manifiesta como errores de entonacion o silabeo en textos complejos; no hay garantia de una prosodia perfecta en todos los contextos.
- La licencia MIT permite uso comercial, pero se debe verificar que el modelo base (Chatterbox) y sus componentes (S3Gen) tambien tengan licencias compatibles. La model card indica que el companion S3Gen se descarga de `cstr/chatterbox-turbo-GGUF`, que deberia revisarse.
- Para produccion, es necesario validar la calidad de audio con el hardware objetivo, especialmente si se usan cuantizaciones agresivas como q4_k, que pueden degradar la fidelidad de la voz.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/JJarvinen/chatterbox-finnish-nano-GGUF
- Modelo safetensors original: https://huggingface.co/JJarvinen/chatterbox-finnish-nano
- Repositorio fuente y runtime helper: https://github.com/jltjarvinen/chatterbox-finnish-nano
- Runtime CrispASR: https://github.com/CrispStrobe/CrispASR
- Companion S3Gen (modelo de codec): https://huggingface.co/cstr/chatterbox-turbo-GGUF
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/JJarvinen/chatterbox-finnish-nano
- Proyecto Chatterbox original de Resemble AI: https://github.com/resemble-ai/chatterbox

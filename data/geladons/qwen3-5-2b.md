# geladons/Qwen3.5-2B

## Resumen

Qwen3.5-2B en formato LiteRT-LM es una conversión del modelo base Qwen/Qwen3.5-2B de Alibaba Qwen al formato propietario de Google LiteRT-LM (anteriormente TensorFlow Lite), empaquetada por el usuario geladons para inferencia completamente local en dispositivos Android. El artefacto publicado no es un modelo nuevo ni un fine-tune: es un bundle `.litertlm` cuantizado a int8 que reproduce el comportamiento del modelo original con un peso de fichero de 2,12 GB. La relevancia práctica está en que permite ejecutar un LLM de 2 mil millones de parámetros sin conexión, sin cuenta y sin infraestructura de servidor en un teléfono.

El modelo hereda la licencia Apache 2.0 del modelo base, lo que facilita su uso comercial y su redistribución. La model card está enfocada al consumo: se distribuye mediante la aplicación Local AI de Google Play, que lo incluye en su catálogo integrado, y también puede integrarse en aplicaciones propias a través del SDK `com.google.ai.edge.litertlm`. No se documentan en la información disponible datos sobre la composición del dataset de entrenamiento, el número de tokens vistos, el contexto máximo ni los idiomas soportados por el modelo base.

La ficha se limita, por tanto, a lo que el autor declara explícitamente: un modelo de texto a texto, cuantizado a int8, para edge computing en Android. Cualquier dato sobre arquitectura interna, benchmarks o capacidades específicas del Qwen3.5-2B original queda marcado como no disponible, ya que la model card no lo reproduce ni lo enlaza con detalle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.5-2B; el bundle es una conversión a LiteRT-LM) |
| Parametros totales | no disponible (el identificador del modelo base indica 2B; no se confirma en la model card) |
| Parametros activos | no aplica (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (único formato publicado: `Qwen3.5-2B_int8_v2.litertlm`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (runtime LiteRT-LM); tamano de fichero 2,12 GB |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base Qwen/Qwen3.5-2B ni detalla el proceso de entrenamiento, el volumen de tokens, la composición del corpus o si hubo etapas de RLHF o DPO. Lo único verificable es el pipeline de conversión: el modelo original se transforma al formato `.litertlm` mediante recetas de conversión (`hf-to-litertlm`) y se cuantiza a int8 para reducir el peso del fichero a 2,12 GB, lo que hace viable su carga en memoria de un dispositivo móvil.

El bundle está pensado para el runtime LiteRT-LM de Google AI Edge, que expone las abstracciones `Engine` y `Conversation` del SDK `com.google.ai.edge.litertlm`. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o mecanismos híbridos en la información proporcionada.

## Capacidades

- Generación de texto a texto: la model card declara explícitamente la modalidad `text → text`.
- Inferencia completamente local: no requiere conexión a la nube ni cuenta de usuario.
- Ejecución en Android mediante el runtime LiteRT-LM y el SDK `com.google.ai.edge.litertlm`.
- Integración en aplicaciones de terceros: el SDK permite apuntar `Engine`/`Conversation` directamente al fichero `.litertlm`.
- Uso sin código mediante la aplicación Local AI de Google Play, que incluye el modelo en su catálogo.
- Tool calling, function calling, razonamiento multi-paso, visión, audio y modo thinking: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles; la model card no enumera idiomas.

## Casos de uso

- Asistente conversacional offline en Android: la aplicación Local AI carga el bundle directamente y permite mantener conversaciones sin conexión, útil en entornos sin red o con requisitos de privacidad estrictos.
- Funcionalidades de texto dentro de una app móvil propia: un desarrollador puede integrar el SDK `com.google.ai.edge.litertlm` y apuntar `Engine`/`Conversation` al fichero para añadir generación de texto sin depender de una API externa.
- Procesamiento de texto sensible en el dispositivo: al no salir los datos del teléfono, encaja en escenarios donde la política de privacidad prohíbe enviar contenido a servidores de terceros.
- Prototipado rápido de experiencias LLM en móvil: el catálogo integrado de Local AI permite evaluar el comportamiento del modelo sin escribir código ni montar infraestructura.
- Aplicaciones de campo o entornos con conectividad intermitente: el modelo funciona íntegramente en local, por lo que no se degrada cuando falla la red.
- Distribución de demos y pruebas de concepto: el bundle de 2,12 GB puede incluirse en builds de aplicaciones Android para demostraciones reproducibles sin backend.
- Reducción de costes operativos en cargas ligeras: al eliminar la inferencia en servidor, se evitan costes por token en flujos de texto de baja complejidad ejecutados en el propio dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario objetivo (Android); el fichero int8 pesa 2,12 GB y debe caber en la memoria del dispositivo junto con el runtime.
- GPU recomendadas: no disponibles; la model card no especifica requisitos de aceleración ni GPUs de referencia.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no disponible; el formato `.litertlm` está orientado al runtime LiteRT-LM en Android, no a despliegues de escritorio con CUDA.
- Opciones de despliegue: runtime LiteRT-LM (`com.google.ai.edge.litertlm`) y la aplicación Local AI de Google Play. vLLM, llama.cpp, Ollama y TGI no se mencionan como compatibles con este formato.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (LLM de ~2B en formato LiteRT-LM para Android) ni datos de rendimiento que permitan establecer una comparación objetiva.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, tasas de alucinación ni evaluaciones de calidad; no hay evidencia publicada en la información disponible.
- El contexto máximo y los idiomas soportados no están declarados, por lo que no puede garantizarse su comportamiento en conversaciones largas o en castellano.
- El artefacto es una conversión de terceros (usuario geladons) del modelo Qwen/Qwen3.5-2B; la calidad final depende de la conversión y de la cuantización int8, que puede introducir pérdida de precisión respecto al modelo original.
- El formato `.litertlm` limita el despliegue al runtime LiteRT-LM y al ecosistema Android; no es directamente utilizable en stacks convencionales de servidor.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin historial de validación por la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.5-2B y de las dependencias del runtime LiteRT-LM antes de distribuir en producción.
- El fichero de 2,12 GB impone requisitos de almacenamiento y memoria en el dispositivo que pueden excluir a terminales de gama baja.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/geladons/Qwen3.5-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio espejo del bundle: https://huggingface.co/geladons/local-ai-models
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Recetas de conversión hf-to-litertlm: https://github.com/john-rocky/hf-to-litertlm
- Aplicación Local AI en Google Play: https://play.google.com/store/apps/details?id=com.ochandydude.localai
- Licencia Apache 2.0: https://spdx.org/licenses/apache-2.0.html

# ibibek/train_chatterbox

## Resumen

`ibibek/train_chatterbox` no es un modelo de lenguaje generativo al uso, sino un kit de infraestructura para el ajuste fino (fine-tuning) y la inferencia con adaptadores LoRA de los modelos de sintesis de voz (TTS) Chatterbox, tanto en su variante Standart como Turbo. Lo publica el usuario ibibek en HuggingFace y su objetivo es facilitar la adaptacion de voces e idiomas nuevos mediante la extension inteligente del vocabulario del tokenizer, con dos estrategias de entrenamiento seleccionables: LoRA o ajuste completo.

El kit permite entrenar sobre dataset propio y elegir entre dos arquitecturas base: el modo Standart, construido sobre una arquitectura de tipo Llama con tokenizer a nivel de grafema (caracter) de unas 2.454 entradas que cubre 23 idiomas, y el modo Turbo, basado en GPT-2 con tokenizer BPE de mas de 50.000 tokens inicialmente en ingles y ampliado automaticamente con el conjunto multilingue de grafemas. La innovacion practica esta en el soporte LoRA, que congela el modelo base y entrena unicamente capas adaptadoras junto a los nuevos embeddings de idioma.

Es relevante para equipos que necesiten clonar voces o anadir idiomas a un sistema TTS sin recalcular el modelo completo: segun la model card, LoRA reduce el uso de VRAM en aproximadamente un 60 por ciento, evita el olvido catastrofico y esta pensado para datasets de 10 horas o menos, mientras que el ajuste completo se reserva para corpus superiores a 10 horas. El repositorio ocupa 3,2 GB y no declara licencia, idiomas ni pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modo Standart: basada en Llama. Modo Turbo: basada en GPT-2. Nucleo T3 Transformer en el ajuste completo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Tokenizer con cobertura de 23 idiomas (entre ellos ingles, turco, frances, aleman y espanol); el resto no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (tras `merge_lora.py`); datos preprocesados en `.pt` |

## Arquitectura y entrenamiento

El kit se organiza en dos modos controlados por el flag `is_turbo` en `src/config.py`. En modo Standart (`is_turbo = False`) la arquitectura es de tipo Llama y emplea un tokenizer basado en grafemas (caracteres) con un vocabulario pequeno de aproximadamente 2.454 tokens que cubre 23 idiomas; esta pensado para tomar control de un idioma concreto desde un nivel mas fundamental. En modo Turbo (`is_turbo = True`) la arquitectura es de tipo GPT-2 con tokenizer BPE y un vocabulario inicial en ingles de mas de 50.000 tokens, que se amplia automaticamente con el conjunto multilingue de grafemas durante `setup.py`; se orienta a aprovechar una base inglesa fuerte para un ajuste mas rapido y de mayor calidad en otros idiomas.

El entrenamiento admite dos estrategias. LoRA congela el modelo base y entrena solo capas adaptadoras junto a los nuevos embeddings de idioma, con salida en la carpeta `new_lang_adapter`, menos VRAM (segun la model card, aproximadamente un 60 por ciento menos), menor riesgo de sobreajuste y proteccion contra el olvido catastrofico; se recomienda para datasets de 10 horas o menos. El ajuste completo (`is_lora = False`) descongela y actualiza todos los pesos del modelo T3 Transformer y se reserva para corpus estrictamente superiores a 10 horas. La model card advierte que los pesos del modo Turbo pueden ser reticentes a adaptarse y que, si aparecen ruidos estaticos, alucinaciones o sonidos sin sentido (monitorizables con el `inference_callback`), conviene pasar a LoRA. El flujo recomendado es entrenar con LoRA, validar con `inference.py` y, una vez satisfecho el resultado, fusionar con `merge_lora.py` para obtener un unico archivo `.safetensors` autonomo. El preprocesado es obligatorio y offline: procesa los audios, extrae embeddings de hablante y tokens acusticos, y los guarda como archivos `.pt`.

## Capacidades

- Sintesis de voz (TTS) de alta calidad a partir de los modelos Chatterbox Standart y Turbo.
- Ajuste fino completo o mediante LoRA sobre dataset propio.
- Adicion de idiomas y voces nuevos mediante extension del vocabulario del tokenizer.
- Soporte multilingue a traves del tokenizer de 23 idiomas incluido.
- Generacion de muestras de audio durante el entrenamiento mediante `inference_callback` para monitorizar la calidad.
- Inferencia directa de adaptadores LoRA con `inference.py`.
- Fusion de pesos LoRA en el modelo base con `merge_lora.py`, produciendo un `.safetensors` autonomo.
- Preprocesado offline de audio con extraccion de embeddings de hablante y tokens acusticos.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio de entrada ni modo de razonamiento explicito.

## Casos de uso

- Clonacion de voz personalizada: entrenar un adaptador LoRA sobre grabaciones de un hablante concreto (10 horas o menos) para generar locuciones con su timbre, aprovechando el menor consumo de VRAM y el menor riesgo de sobreajuste.
- Localizacion de un sistema TTS a un idioma nuevo: extender el vocabulario con los caracteres especificos no cubiertos por el tokenizer por defecto (por ejemplo, grafemas propios de un idioma sin soporte) y ajustar el modelo para sintetizar en ese idioma.
- Audiolibros y narracion automatizada: generar grandes volumenes de texto hablado con una voz consistente, usando el modo Turbo para acelerar el ajuste sobre la base inglesa.
- Asistentes de voz embebidos: producir un modelo ajustado y fusionado (`.safetensors`) que se pueda desplegar como componente TTS autonomo en un producto.
- Doblaje y contenido multimedia: adaptar la sintesis a voces y acentos concretos para doblaje de videos o anuncios, validando la calidad con las muestras del `inference_callback`.
- Investigacion en adaptacion eficiente de parametros: usar el kit como banco de pruebas para comparar LoRA frente a ajuste completo sobre el mismo corpus acustico.
- Prototipado rapido de voces para demos: entrenar un adaptador ligero, probarlo con `inference.py` y descartarlo o fusionarlo segun el resultado, sin comprometer el modelo base.
- Accesibilidad: generar voz sintetica personalizada para interfaces de lectura asistida con un timbre adaptado al usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: no disponible.
- VRAM para entrenamiento: no disponible en cifras absolutas. La model card indica que LoRA usa aproximadamente un 60 por ciento menos de VRAM que el ajuste completo.
- GPU recomendadas: no disponible. El ajuste completo se describe como intensivo en VRAM ("massive GPU VRAM"), sin especificar modelos.
- Encaje en GPU de consumo: no disponible.
- Opciones de despliegue: el kit incluye `inference.py` para probar adaptadores y `merge_lora.py` para producir un `.safetensors` listo para produccion. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible. El preprocesado offline se presenta como una estrategia para maximizar la velocidad de entrenamiento, sin cifras concretas.

## Comparativa con modelos similares

No disponible. La informacion proporcionada solo describe el kit de ajuste y menciona los modelos base Chatterbox Standart y Turbo, pero no incluye datos de parametros, contexto, rendimiento ni licencia que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- El repositorio no declara licencia, por lo que se desconoce si permite uso comercial; conviene verificarlo antes de cualquier despliegue en produccion.
- No hay benchmarks publicados ni resultados cuantitativos de calidad de voz en la informacion disponible.
- El cambio entre los modos Standart y Turbo exige borrar por completo los directorios `pretrained_models` y `preprocessed_dir` antes de volver a ejecutar `setup.py`; de lo contrario los archivos de tokens se corrompen y generan errores dificiles de depurar.
- El preprocesado offline es obligatorio; omitirlo o hacerlo mal afecta al entrenamiento.
- El ajuste completo de los pesos del modo Turbo puede degradar la calidad base si el dataset es demasiado pequeno, con riesgo de ruido estatico, alucinaciones o sonidos sin sentido.
- El tokenizer por defecto cubre 23 idiomas; los idiomas con caracteres no incluidos requieren un `tokenizer.json` personalizado.
- Riesgo de olvido catastrofico en ajuste completo sobre corpus pequenos; LoRA se presenta como mitigacion.
- No se documentan sesgos conocidos, comportamiento en contextos largos ni capacidades de tool calling o agentes.
- La fecha del repositorio (2026) y la ausencia de descargas o interacciones no permiten validar su madurez ni su mantenimiento.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/ibibek/train_chatterbox
- Repositorio original de Chatterbox (referenciado en la model card, sin URL explicita): no disponible
- Paper, blog o demo adicionales: no disponibles

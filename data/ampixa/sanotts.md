# ampixa/sanoTTS

## Resumen

sanoTTS es una familia de voces neuronales de síntesis de habla (text-to-speech) de tamano extremadamente reducido, desarrollada por el autor independiente ampixa. Su rango de parametros va de 294.279 a 2.272.145, lo que le permite ejecutarse en tiempo real sobre microcontroladores de bajo coste como el ESP32-S3 (unos 3 USD) o directamente en el navegador mediante WebAssembly, sin dependencia de la nube ni de aceleradores NPU. El modelo resuelve el problema de desplegar TTS neuronal en entornos con recursos muy limitados, donde soluciones convencionales de cientos de millones de parametros resultan inviables.

La familia cubre 31 voces en 17 idiomas (ingles, nepalí, hindi, vietnamita, indonesio, chino, aleman, frances, espanol, italiano, portugues, ruso, checo, rumano, turco, arabe y polaco), con huellas por voz de entre 337 KB y 8,7 MB. Incluye el fonemizador espeak-ng empaquetado, de modo que el paquete no tiene dependencias externas. La libreria asociada es `sanotts` (Python) y `sanotts-web` (JavaScript).

El modelo resulta relevante por su combinacion de tamano minimo, soporte multilingue amplio y ejecucion en hardware embebido y navegador, lo que lo situa en una categoria distinta a la de los TTS neuronales convencionales. La licencia es GPL-3.0, lo que condiciona su uso en productos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo neuronal TTS; se menciona destilacion como tecnica de entrenamiento) |
| Parametros totales | 294.279 – 2.272.145 (segun la voz; dato real en safetensors: 294.279 para la variante mas pequena) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 para formato MCU (variante robot, 567 k); resto de voces en formato nativo del paquete |
| Idiomas soportados | en, ne, hi, vi, id, zh, de, fr, es, it, pt, ru, cs, ro, tr, ar, pl (17 idiomas; polaco solo en demo) |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors y GGUF; bundles web para navegador; formato int8 para microcontrolador |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo (no se especifica si es un transformer, una arquitectura hibrida o un modelo acustico con vocoder integrado). La model card menciona explicitamente la **destilacion** como parte del proceso, lo que sugiere que las voces de menor tamano (hasta 294 k parametros) se obtienen comprimiendo variantes mayores. El rango de parametros por voz (294 k a 2,27 M) indica variantes de distinto tamano para un mismo idioma, como se observa en las voces inglesas (heart 2,27 M, hfc 1,83 M, amy 1,46 M, kristin 1,40 M, amy-small 1,08 M, heart-nano 294 k).

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. La model card indica que el fonemizador espeak-ng va incluido en el paquete, lo que implica que el pipeline convierte texto a fonemas antes de la sintesis. Se menciona una metrica de calidad perceptual denominada SCOREQ, con valores entre 2,29 y 4,13 segun la voz.

## Capacidades

- Sintesis de voz (text-to-speech) en 17 idiomas, con 31 voces en la demo en vivo.
- Ejecucion en tiempo real sobre microcontrolador ESP32-S3 (salida por GPIO hacia un LM386 y altavoz).
- Ejecucion en navegador mediante WebAssembly, sin servidor ni subida de datos.
- Paquete Python (`sanotts` >= 0.3.0) y paquete JavaScript (`sanotts-web` >= 0.3.0).
- Fonemizacion integrada mediante espeak-ng, sin dependencias externas.
- Voz int8 especifica para microcontrolador (variante robot, 567 k parametros).
- No se documentan capacidades de tool calling, agentes, vision, audio de entrada ni modo de razonamiento.

## Casos de uso

- **Dispositivos IoT con voz**: integracion en un ESP32-S3 para dar voz a electrodomesticos, sensores o wearables de bajo coste, con salida directa por GPIO a un amplificador LM386 y un altavoz. El tamano de 337 KB a 8,7 MB por voz permite almacenar el modelo en la memoria flash del microcontrolador.
- **Aplicaciones web sin servidor**: sintesis de voz en el navegador mediante WebAssembly, util para lectores de pantalla, tutoriales interactivos o accesibilidad en paginas estaticas, sin enviar texto a un servidor y sin coste de infraestructura.
- **Asistentes de voz offline**: despliegue en entornos sin conectividad (zonas rurales, instalaciones industriales, dispositivos aislados) donde no es posible recurrir a APIs en la nube.
- **Prototipado rapido multilingue**: uso del paquete Python para generar audio en 17 idiomas en fases de prototipo, con una sola dependencia y sin GPU.
- **Sistemas embebidos de bajo consumo**: dispositivos alimentados por bateria que requieren sintesis de voz con consumo energetico minimo, gracias al reducido numero de parametros y a la ausencia de NPU.
- **Educacion y acceso a la lectura**: aplicaciones de lectura en voz alta para personas con discapacidad visual en hardware economico o en el navegador, con soporte para nepalí, hindi y otros idiomas poco cubiertos por soluciones comerciales.
- **Juguetes y dispositivos interactivos**: productos de consumo con voz sintetizada a un coste de hardware de pocos dolares, donde el modelo cabe en el presupuesto de memoria y computo del dispositivo.

## Benchmarks y rendimiento

La model card incluye la metrica SCOREQ (calidad perceptual de la voz) para las voces inglesas, pero no se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo TTS.

| Voz | Idioma | Parametros | SCOREQ |
|---|---|---:|---:|
| heart | Ingles | 2,27 M | 3,48 |
| hfc | Ingles | 1,83 M | 3,94 |
| amy | Ingles | 1,46 M | 4,13 |
| kristin | Ingles | 1,40 M | 4,09 |
| amy-small | Ingles | 1,08 M | 3,70 |
| heart-nano | Ingles | 294 k | 2,29 |
| robot (int8) | Ingles | 567 k | no disponible |

No se dispone de datos de latencia ni de throughput medidos en la informacion proporcionada, salvo la afirmacion de ejecucion en tiempo real en ESP32-S3.

## Requisitos de hardware

- **Microcontrolador**: ESP32-S3 (aproximadamente 3 USD), con salida por GPIO a un LM386 y altavoz. La variante int8 de 567 k parametros esta pensada para este formato.
- **Navegador**: cualquier navegador moderno con soporte de WebAssembly; no requiere GPU dedicada.
- **CPU**: el paquete Python funciona en CPU sin GPU; el tamano del modelo (hasta 2,27 M parametros) no requiere aceleracion.
- **VRAM estimada**: no aplica; el modelo no esta disenado para inferencia en GPU y su huella es de kilobytes a megabytes.
- **Opciones de despliegue**: paquete Python `sanotts`, paquete JavaScript `sanotts-web`, bundles WebAssembly, formato int8 para MCU, pesos en safetensors y GGUF.
- **Almacenamiento**: de 337 KB a 8,7 MB por voz; el repositorio completo ocupa 0,4 GB.
- **Latencia y throughput**: se afirma ejecucion en tiempo real en ESP32-S3; no se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Ejecucion en MCU/navegador |
|---|---|---|---|---|---|
| sanoTTS | 294 k – 2,27 M | no disponible | 17 | GPL-3.0 | Si (ESP32-S3 y WASM) |
| Piper | no disponible en la informacion | no disponible | varios | no disponible | no disponible |
| Modelos TTS neuronales convencionales | cientos de millones | no disponible | variable | variable | No |

La model card menciona Piper entre las etiquetas del modelo, lo que sugiere una relacion o comparacion con esa familia de TTS ligero, pero no se aportan datos comparativos concretos. No se dispone de informacion suficiente para una comparativa detallada con alternativas de la misma categoria.

## Limitaciones y advertencias

- **Licencia GPL-3.0**: el uso comercial en productos propietarios exige cumplir con las obligaciones de copyleft de la GPL, lo que puede ser incompatible con software cerrado.
- **Calidad de voz limitada**: el rango de SCOREQ (2,29 a 4,13) indica calidad variable; la variante mas pequena (heart-nano, 294 k) obtiene 2,29, notablemente inferior a las voces mayores.
- **Cobertura desigual por idioma**: el polaco solo esta disponible en la demo y sus pesos no se alojan en el repositorio de Hugging Face; el chino del repositorio es una version antigua mantenida por compatibilidad, mientras que la demo usa el reemplazo Chinese Xiaoya.
- **Riesgo de alucinacion y errores de pronunciacion**: al ser un modelo TTS, los fallos se manifiestan como pronunciaciones incorrectas o artefactos acusticos, especialmente en textos fuera del dominio de entrenamiento o con fonemas poco frecuentes.
- **Sesgos**: no se documentan sesgos especificos, pero las voces estan entrenadas sobre datasets concretos (por ejemplo, NewTTS para indonesio o VAIS-1000 para vietnamita) cuyas caracteristicas pueden limitar la variedad de acentos y estilos.
- **Dependencia de espeak-ng**: la fonemizacion se delega en espeak-ng, lo que puede limitar la naturalidad en idiomas con reglas foneticas complejas.
- **Informacion tecnica incompleta**: no se detallan arquitectura, datos de entrenamiento ni contexto, lo que dificulta evaluar el modelo en profundidad.
- **Fallback de red**: los paquetes descargan pesos desde Hugging Face por defecto, con respaldo en GitHub o Pages; en despliegues autoalojados conviene fijar `SANOTTS_VOICE_SOURCE` o `voiceBase` para evitar dependencias externas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ampixa/sanoTTS
- Demo en vivo: https://tts.ampixa.com/sanoTTS
- Repositorio GitHub: https://github.com/Ampixa/sanoTTS
- Bundles web de voces: https://huggingface.co/ampixa/sanoTTS/tree/main/web/voices
- Voz Chinese Xiaoya: https://huggingface.co/ampixa/sanoTTS/tree/main/web/voices/chinese-xiaoya
- Directorio de la voz heart: https://huggingface.co/ampixa/sanoTTS/tree/main/heart
- Directorio de la voz hfc: https://huggingface.co/ampixa/sanoTTS/tree/main/hfc-en-1p8m
- Directorio de la voz amy: https://huggingface.co/ampixa/sanoTTS/tree/main/amy-en-1p46m
- Directorio de la voz kristin: https://huggingface.co/ampixa/sanoTTS/tree/main/kristin-en-1p4m
- Directorio de la voz amy-small: https://huggingface.co/ampixa/sanoTTS/tree/main/amy-en-1p1m
- Directorio de la voz heart-nano: https://huggingface.co/ampixa/sanoTTS/tree/main/heartnano
- Directorio de la voz indonesia: https://huggingface.co/ampixa/sanoTTS/tree/main/id-newstts-1p46m
- Directorio de la voz vietnamita: https://huggingface.co/ampixa/sanoTTS/tree/main/vi-vais1000-1p46m
- Bundle web de nepalí: https://huggingface.co/ampixa/sanoTTS/tree/main/web/voices/nepali
- Bundle web de hindi: https://huggingface.co/ampixa/sanoTTS/tree/main/web/voices/hindi

# catsaiagency/Serval-1.8B-Japan-Travel-GGUF

## Resumen

Serval-1.8B-Japan-Travel es un modelo de traducción automática neuronal de 1.791.080.448 parámetros (aproximadamente 1,8 mil millones), desarrollado por CatsAI Agency, especializado en la traducción entre japonés y otras nueve lenguas en cualquier dirección (90 pares). Parte del modelo Hy-MT2-1.8B de Tencent (licencia Apache-2.0) y se ha afinado específicamente sobre textos de viajes que contienen alrededor de 11.000 nombres de lugares, estaciones, platos y otros topónimos japoneses. El repositorio publicado contiene únicamente la cuantización Q4_K_M en formato GGUF, de aproximadamente 1,1 GB, pensada para ejecución en CPU sin GPU.

La relevancia del modelo reside en su enfoque de dominio: mejora la precisión en la lectura y traducción de nombres propios japoneses difíciles, un punto históricamente débil en los sistemas de traducción genéricos, y admite un glosario externo de pares de nombres que el modelo respeta casi literalmente. Según la model card, con glosario alcanza un 88,5 % de nombres traducidos correctamente desde el japonés, frente al 36,4 % del Serval genérico. El coste de esta especialización es una ligera pérdida de calidad en texto general (0,2 a 0,4 puntos COMET).

El modelo está diseñado para despliegue local y privado: traduce una frase en aproximadamente un segundo en una CPU convencional, con unos 2,5 GB de RAM en ejecución, y no requiere que el texto salga de la máquina. La licencia es propietaria (CatsAI Model License), con uso gratuito para pruebas y pago por máquina para uso productivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Hy-MT2-1.8B de Tencent); detalles internos no disponibles |
| Parametros totales | 1.791.080.448 (aproximadamente 1,8 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (configuración del servidor llama-server) |
| Tipos de cuantizacion | Q4_K_M (única publicada en este repositorio); pesos sin cuantizar en el repositorio base |
| Idiomas soportados | ja, en, zh, ko, es, fr, de, pt, pl, hr (10 idiomas, 90 direcciones) |
| Licencia | CatsAI Model License (propietaria; gratuita para pruebas, pago por máquina para uso real) |
| Formato de pesos | GGUF (Q4_K_M); safetensors en el repositorio base sin cuantizar |

## Arquitectura y entrenamiento

El modelo es un transformer de 1,8 mil millones de parámetros derivado de Hy-MT2-1.8B (Tencent, Apache-2.0), al que se ha aplicado un ajuste fino adicional y se ha añadido el croata como décima lengua. El ajuste fino se realizó sobre textos de viajes que contienen aproximadamente 11.000 nombres de lugares, estaciones y platos japoneses, con el objetivo de mejorar la lectura y transliteración de topónimos difíciles. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica destacable es el soporte de glosarios: la aplicación puede suministrar una lista de pares de nombres y el modelo los traduce casi exactamente como se especifica. Según la model card, los topónimos empleados en la evaluación no estaban en los datos de entrenamiento y los textos de prueba se redactaron específicamente para el test, con traducciones de referencia generadas por un modelo grande que podía consultar la lista de pares de nombres (nombres procedentes de Wikidata, CC0).

## Capacidades

- Traducción entre 10 idiomas (japonés, inglés, chino, coreano, español, francés, alemán, portugués, polaco y croata) en las 90 direcciones posibles.
- Traducción especializada en el dominio de viajes en Japón: nombres de lugares, estaciones, platos y otros topónimos.
- Respeto de glosarios externos de pares de nombres, con traducción casi literal de los términos incluidos.
- Traducción de texto largo por fichero: cada línea se traduce por separado y las líneas largas se procesan en fragmentos de varias frases, conservando los saltos de línea.
- Ejecución local sin GPU, con privacidad del texto (no sale de la máquina).
- Entrada: texto origen y un par de idiomas; salida: únicamente la traducción.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Traducción de carteles y avisos turísticos: el modelo traduce textos breves de una frase a un párrafo por petición, adecuado para señalética, menús o folletos en japonés hacia las nueve lenguas restantes, con especial acierto en nombres de estaciones y platos.
- Asistencia a viajeros en tiempo real: al ejecutarse en CPU a aproximadamente un segundo por frase y sin GPU, puede integrarse en aplicaciones de escritorio o portátiles para traducir conversaciones y consultas durante un viaje, manteniendo el texto en local.
- Traducción de documentación de itinerarios: el modo `--file` traduce ficheros de texto línea a línea conservando la estructura, útil para agencias que gestionan itinerarios y descripciones de tours en varios idiomas.
- Localización de contenido turístico con glosario: al aceptar un glosario de pares de nombres, permite fijar la traducción oficial de topónimos y marcas de establecimientos, garantizando consistencia entre distintas páginas y materiales.
- Traducción de atención al cliente en establecimientos: con contexto de 4.096 tokens y procesamiento local, puede desplegarse en un servidor ligero para traducir consultas de huéspedes en hoteles o ryokan entre japonés y las lenguas europeas y asiáticas soportadas.
- Traducción de reseñas y contenido generado por usuarios: el modelo cubre las 90 direcciones, lo que permite normalizar reseñas multilingües de plataformas de viaje hacia un idioma común para su análisis.
- Despliegue en entornos con requisitos de privacidad: al no requerir GPU ni conexión externa, encaja en organismos o empresas que no pueden enviar texto a servicios en la nube.

## Benchmarks y rendimiento

Resultados publicados en la model card (test propio de viajes con 2.160 textos, japonés ↔ 9 idiomas; COMET ×100):

| Metrica | Serval | Travel version | Travel version + glosario |
|---|---|---|---|
| COMET (×100) | 88,9 | 91,6 | No disponible |
| Nombres traducidos correctamente, desde japonés | 36,4 % | 47,9 % | 88,5 % |
| Nombres traducidos correctamente, hacia japonés | 16,5 % | 44,0 % | 63,4 % |

En las 1.137 frases con entradas de glosario, sin glosario la versión de viajes obtiene 48,4 % y 43,9 % (desde y hacia japonés).

Calidad general (FLORES-200 devtest, media de 90 direcciones, COMET ×100):

| Modelo | COMET (×100) |
|---|---|
| Serval-1.8B-Japan-Travel Q4_K_M (este fichero) | 86,7 |
| Serval-1.8B-Japan-Travel sin cuantizar | 87,0 |
| Modelo base Hy-MT2-1.8B | 86,0 |

Croata (medido en este fichero Q4_K_M): hacia hr 86,5 (base 81,4); desde hr 85,1 (base 82,5).

Rendimiento en CPU (Core i7-11800H, 6 hilos): aproximadamente 32 tokens/s de generación y 210 tokens/s de lectura de prompt; alrededor de 1 segundo por frase.

## Requisitos de hardware

- VRAM: no requiere GPU; consume aproximadamente 2,5 GB de RAM en ejecución con la cuantización Q4_K_M.
- GPU recomendadas: no aplica; el modelo está pensado para CPU. Cualquier GPU compatible con llama.cpp podría usarse, pero no se documentan requisitos ni rendimiento en GPU.
- Cabe en cualquier PC convencional: el fichero GGUF ocupa aproximadamente 1,1 GB y el modelo corre en CPU con 6 hilos a unos 32 tokens/s de generación.
- Opciones de despliegue: llama.cpp mediante `llama-server` (probado con la versión b11829), con scripts `start-server.sh` (Linux/macOS) y `start-server.ps1` (Windows); también se incluye `serval.py` como herramienta de línea de comandos y función Python importable. No se documentan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: aproximadamente 1 segundo por frase en Core i7-11800H con 6 hilos; 32 tokens/s de generación y 210 tokens/s de lectura de prompt.
- Variables de entorno configurables: `PORT` (por defecto 8080), `THREADS` (por defecto 4) y `MODEL`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Calidad (COMET ×100, FLORES-200) | Licencia | Formato |
|---|---|---|---|---|---|---|
| Serval-1.8B-Japan-Travel (Q4_K_M) | 1,8 B | 4.096 | 10 (90 direcciones) | 86,7 | CatsAI Model License (propietaria) | GGUF |
| Serval-1.8B (genérico) | 1,8 B | 4.096 | 10 | No disponible en la información | CatsAI Model License | GGUF |
| Hy-MT2-1.8B (Tencent) | 1,8 B | No disponible | No disponible | 86,0 | Apache-2.0 | No disponible |

El modelo base Hy-MT2-1.8B es la alternativa directa con licencia permisiva (Apache-2.0), aunque sin el ajuste fino en dominio de viajes ni el soporte de glosario. El Serval genérico mantiene mejor calidad en texto general (0,2 a 0,4 puntos COMET por encima) pero es claramente inferior en nombres propios japoneses (36,4 % frente a 47,9 % sin glosario). No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Sin glosario, el modelo sigue malinterpretando algunos nombres propios: la model card cita el ejemplo de 久御山町 (Kumiyama), traducido como "Kugoyama". Para nombres críticos es necesario suministrar el glosario.
- En texto general la versión de viajes rinde entre 0,2 y 0,4 puntos COMET por debajo del Serval genérico; para traducción general se recomienda el modelo Serval-1.8B-GGUF.
- El contexto del servidor es de 4.096 tokens y el modelo está pensado para traducir de una frase a un párrafo por petición; no es adecuado para documentos muy largos en una sola llamada.
- La licencia es propietaria (CatsAI Model License): gratuita para probar, pero con pago por máquina para uso productivo. Es imprescindible revisar `MODEL-LICENSE.md` antes de un despliegue comercial.
- No se documentan en la información disponible sesgos conocidos ni tasas de alucinación específicas; al ser un modelo de traducción, el riesgo principal es la traducción incorrecta de nombres propios y términos fuera de dominio.
- El repositorio solo publica la cuantización Q4_K_M; los pesos sin cuantizar están en el repositorio base y no se detallan otras cuantizaciones.
- No se documentan capacidades de tool calling, agentes ni multimodalidad; el modelo es exclusivamente de traducción texto a texto.
- La información sobre arquitectura interna, datos de entrenamiento y proceso de ajuste (RLHF/DPO) no está disponible.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/catsaiagency/Serval-1.8B-Japan-Travel-GGUF
- Repositorio del modelo base sin cuantizar: https://huggingface.co/catsaiagency/Serval-1.8B-Japan-Travel
- Serval-1.8B genérico: https://huggingface.co/catsaiagency/Serval-1.8B
- Serval-1.8B-GGUF genérico: https://huggingface.co/catsaiagency/Serval-1.8B-GGUF
- Sitio web del proyecto: https://catsai.agency/en/serval
- Licencia del modelo: https://huggingface.co/catsaiagency/Serval-1.8B-Japan-Travel-GGUF/blob/main/MODEL-LICENSE.md
- README en japonés: README.ja.md (en el repositorio)
- llama.cpp (releases oficiales): https://github.com/ggml-org/llama.cpp/releases

# catsaiagency/Serval-1.8B-Japan-Travel

## Resumen

Serval 1.8B Japan Travel es un modelo de traducción automática de 1.791 millones de parámetros desarrollado por CatsAI Agency, especializado en la traducción entre japonés y otras nueve lenguas en un contexto de viajes por Japón. Se construye por ajuste fino (finetune) sobre Serval-1.8B, que a su vez deriva del modelo Hy-MT2-1.8B de Tencent (licencia Apache-2.0), al que se añadió el croata. El ajuste específico se realizó sobre textos de viaje que contienen aproximadamente 11.000 nombres de lugares, estaciones y platos japoneses, con el objetivo de reducir los errores de lectura de topónimos difíciles.

El modelo resuelve un problema concreto: la traducción fiable de nombres propios japoneses (lugares, estaciones, platos) en las diez direcciones de traducción soportadas (ja, en, zh, ko, es, fr, de, pt, pl, hr). Cuando la aplicación proporciona un glosario de pares de nombres, la traducción de dichos nombres se aproxima a la especificada. Está pensado para ejecutarse en CPU sin GPU: en un Intel Core i7-11800H con 6 hilos genera a unos 32 tokens/s y traduce una frase en aproximadamente un segundo, lo que lo hace adecuado para despliegues locales donde el texto no abandona la máquina.

La relevancia actual reside en su enfoque de licencia y despliegue: los pesos sin cuantizar (safetensors, bfloat16) se publican para conversión y ajuste, mientras que la ejecución recomendada es el GGUF Q4_K_M con llama.cpp. La licencia CatsAI Model License permite probar gratis pero exige pago por máquina para uso productivo, un modelo poco habitual que conviene evaluar antes de integrarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (hunyuan_v1_dense), según tags del repositorio |
| Parámetros totales | 1.791.080.448 (1,8 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (configuración del servidor) |
| Tipos de cuantización | GGUF Q4_K_M (1,1 GB); pesos sin cuantizar en bfloat16 |
| Idiomas soportados | ja, en, zh, ko, es, fr, de, pt, pl, hr (10 idiomas, 90 direcciones) |
| Licencia | CatsAI Model License (prueba gratuita; uso productivo de pago por máquina); modelo base Hy-MT2-1.8B bajo Apache-2.0 |
| Formato de pesos | safetensors (bfloat16) en este repositorio; GGUF Q4_K_M en el repositorio GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 1,8 mil millones de parámetros, identificado en los tags del repositorio como `hunyuan_v1_dense`, derivado de Hy-MT2-1.8B de Tencent (Apache-2.0). Sobre esa base se aplicó un ajuste fino adicional que añadió el croata al conjunto de idiomas y, posteriormente, un segundo ajuste específico sobre textos de viaje que contienen alrededor de 11.000 nombres de lugares, estaciones y platos japoneses. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación principal no es arquitectónica sino de especialización: el ajuste sobre nombres propios japoneses mejora la lectura y traducción de topónimos difíciles, y el modelo admite un glosario de pares de nombres en el prompt que fuerza traducciones casi exactas de los términos incluidos. El prompt de entrenamiento es específico y el modelo solo se comporta como se describe cuando se le proporciona dicho prompt; la generación se realiza con temperatura 0 y penalización por repetición de 1,05.

## Capacidades

- Traducción entre 10 idiomas en las 90 direcciones posibles (ja, en, zh, ko, es, fr, de, pt, pl, hr).
- Traducción especializada de nombres propios japoneses (lugares, estaciones, platos) con menor tasa de error de lectura.
- Soporte de glosario: si la aplicación proporciona pares de nombres, la traducción de esos términos se aproxima a la especificada.
- Entrada de texto y par de idiomas, salida únicamente de la traducción.
- Ejecución en CPU sin GPU, con el texto sin salir de la máquina.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento.

## Casos de uso

- Traducción de señalética y textos turísticos en aplicaciones de viaje: el modelo traduce frases y párrafos entre japonés y las nueve lenguas restantes, con especial precisión en nombres de estaciones y lugares cuando se le pasa un glosario de los términos relevantes.
- Asistentes de viaje locales sin conexión: al ejecutarse en CPU con unos 2,5 GB de RAM y traducir una frase en aproximadamente un segundo, puede integrarse en aplicaciones de escritorio o dispositivos donde el texto no debe salir de la máquina.
- Traducción de menús y nombres de platos: el ajuste sobre 11.000 nombres japoneses reduce los errores de lectura de platos y permite forzar la traducción correcta mediante glosario.
- Localización de contenido turístico hacia japonés: la mejora en la dirección hacia japonés (44,0 % de nombres correctos frente a 16,5 % del modelo base) la hace útil para traducir guías y fichas de viaje al japonés.
- Procesamiento por lotes de reseñas y textos de viaje: con el servidor llama.cpp configurado con varios slots (`-np` y `-c`), puede atender múltiples peticiones simultáneas de traducción de una frase a un párrafo.
- Traducción de documentación de viaje multilingüe: cubre las diez lenguas soportadas, incluido el croata, que el modelo base no incluía, para proyectos con cobertura de Europa del Este.
- Integración en pipelines de traducción con control de glosario: la aplicación puede construir el glosario a partir de los nombres presentes en el texto (máximo cinco términos recomendados) y obtener traducciones consistentes de marcas y topónimos.

## Benchmarks y rendimiento

| Prueba (2.160 textos, japonés ↔ 9 idiomas) | Serval | Travel version | Travel version + glosario |
|---|---|---|---|
| COMET (×100) | 88,9 | 91,6 | No disponible |
| Nombres traducidos correctamente, desde japonés | 36,4 % | 47,9 % | 88,5 % |
| Nombres traducidos correctamente, hacia japonés | 16,5 % | 44,0 % | 63,4 % |

| Métrica adicional | Valor |
|---|---|
| FLORES-200 devtest, media de 90 direcciones, COMET (×100), Q4_K_M | 86,7 |
| FLORES-200 devtest, media de 90 direcciones, COMET (×100), sin cuantizar | 87,0 |
| FLORES-200 devtest, media de 90 direcciones, COMET (×100), modelo base | 86,0 |
| Croata, hacia hr, COMET (×100), Q4_K_M | 86,5 (base: 81,4) |
| Croata, desde hr, COMET (×100), Q4_K_M | 85,1 (base: 82,5) |

Notas de medición: los topónimos del test no estaban en los datos de entrenamiento; los textos se escribieron para la prueba y las traducciones de referencia las generó un modelo grande que pudo consultar la lista de pares de nombres. Los nombres proceden de Wikidata (CC0). Las filas de glosario se midieron sobre los 1.137 textos con entradas de glosario (sin glosario, la versión de viaje obtiene 48,4 % y 43,9 % en esos textos). En texto general, la versión de viaje obtiene de 0,2 a 0,4 puntos COMET menos que Serval.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; en CPU consume unos 2,5 GB de RAM en ejecución con el GGUF Q4_K_M (1,1 GB en disco).
- GPU recomendadas: no se especifican; el modelo está diseñado para CPU y no se documentan requisitos de GPU.
- Cabe en cualquier PC de consumo: probado en un Intel Core i7-11800H con 6 hilos, con unos 32 tokens/s de generación y unos 210 tokens/s de lectura de prompt, aproximadamente un segundo por frase.
- Opciones de despliegue: llama.cpp con el GGUF Q4_K_M (recomendado por el autor), con scripts de arranque para Linux y PowerShell; los pesos safetensors en bfloat16 permiten conversión y cuantización propia con transformers.
- Latencia y throughput: alrededor de 1 segundo por frase en la CPU de referencia; para muchas peticiones simultáneas hay que aumentar `-np` y `-c` en `start-server` (por ejemplo, `-np 4 -c 16384`).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Serval-1.8B-Japan-Travel | 1,8 B | 4.096 tokens | 10 (90 direcciones) | CatsAI Model License (pago por máquina en uso productivo) | Hugging Face (safetensors y GGUF) |
| Serval-1.8B (modelo base de la familia) | 1,8 B | 4.096 tokens | 10 (90 direcciones) | CatsAI Model License | Hugging Face (incluye GGUF) |
| Hy-MT2-1.8B (Tencent, modelo original) | 1,8 B | No disponible | No disponible (sin croata) | Apache-2.0 | Hugging Face |

El modelo de viaje sacrifica de 0,2 a 0,4 puntos COMET en texto general frente a Serval-1.8B a cambio de mejoras notables en nombres propios japoneses; para traducción general el autor recomienda Serval-1.8B-GGUF. Frente a Hy-MT2-1.8B, la familia Serval añade el croata y una licencia más restrictiva para uso productivo.

## Limitaciones y advertencias

- El modelo solo se comporta como se describe cuando se le proporciona el prompt exacto con el que fue entrenado; usar otro prompt puede degradar la calidad.
- Hay que indicar explícitamente el idioma de origen; no se detecta automáticamente.
- Enviar una frase a un párrafo por petición; es la longitud de entrenamiento. Las piezas largas se cortan en finales de frase y no comparten contexto.
- Incluir en el glosario solo nombres presentes en el texto, cinco como máximo, y no incluir un nombre con dos traducciones distintas; cada término añade unos 10 tokens al prompt y ralentiza la petición.
- Sin glosario sigue habiendo errores de lectura de nombres: el ejemplo documentado es 久御山町 (Kumiyama), traducido como "Kugoyama".
- Se esperan errores: conviene que una persona revise números, horas, nombres propios y términos técnicos en textos importantes; el modelo a veces elige una palabra incorrecta.
- Si la salida devuelve `"truncated": true`, se ha cortado; hay que dividir el texto de origen en piezas más cortas.
- En Windows, el uso de tuberías (`|`) puede corromper caracteres; es más seguro pasar un archivo UTF-8 con `--file`. Los scripts de PowerShell no se probaron en una máquina Windows real.
- Licencia: probar es gratis en cualquier máquina, pero el uso para trabajo real requiere una licencia de pago por cada máquina donde se instale (incluido un PC de desarrollo si se usa para trabajo real). Es un caveat importante para producción.
- No se documentan sesgos específicos ni riesgos de alucinación más allá de los errores de traducción descritos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/catsaiagency/Serval-1.8B-Japan-Travel
- GGUF y manual completo: https://huggingface.co/catsaiagency/Serval-1.8B-Japan-Travel-GGUF
- Modelo base de la familia: https://huggingface.co/catsaiagency/Serval-1.8B
- GGUF de la familia: https://huggingface.co/catsaiagency/Serval-1.8B-GGUF
- Modelo original de Tencent: https://huggingface.co/tencent/Hy-MT2-1.8B
- Licencia del modelo: https://huggingface.co/catsaiagency/Serval-1.8B-Japan-Travel/blob/main/MODEL-LICENSE.md
- Sitio web del autor: https://catsai.agency/en/serval
- Contacto para licencias: https://catsai.agency/contact

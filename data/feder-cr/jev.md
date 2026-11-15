# feder-cr/jev

## Resumen

jevos-v4 (publicado en Hugging Face como `feder-cr/jev`) es un modelo de decisión especializado en clasificación zero-shot de texto, desarrollado por Federico Elia (@feder-cr) junto con Loris Salsi (@LosaLosSantos). No es un modelo generativo al uso: recibe un texto y una pregunta formulada en lenguaje natural (de tipo sí/no, elección múltiple o puntuación ordinal) y devuelve la probabilidad de cada respuesta. Su objetivo es sustituir llamadas a APIs en la nube por inferencia local en CPU, con latencias de entre 28 y 130 ms según la longitud de la petición.

El modelo cuenta con 882 millones de parámetros y una ventana de contexto de 8.192 tokens, y se distribuye en tres formatos: un modelo OpenVINO INT8 que ejecuta el binario `jev`, y dos cuantizaciones GGUF (Q4_K_M y Q8_0) para llama.cpp y su ecosistema. La propuesta de valor es clara: un único binario sin dependencias de Python, que corre en CPU de portátil y expone una API HTTP compatible con el formato de cable del SDK de Jev, de modo que el código escrito para la API en la nube funciona sin cambios para preguntas de sí/no.

Es relevante ahora porque cubre un nicho concreto —clasificación y enrutamiento de decisiones en pipelines de agentes y automatización— donde los LLM generativos resultan caros y lentos para tareas que se reducen a una etiqueta o una probabilidad. El autor advierte explícitamente de que es menos preciso que la API en la nube de Jev en las tareas más difíciles, por lo que debe validarse con las preguntas propias antes de confiar en él en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decisión/clasificación; se distribuye como OpenVINO INT8 y GGUF) |
| Parametros totales | 882.430.464 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | INT8 (OpenVINO), Q4_K_M (GGUF), Q8_0 (GGUF) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | OpenVINO (directorio `model/`), GGUF (Q4_K_M y Q8_0) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo (familia, tipo de transformer, mecanismo de atención ni composición del dataset). Lo que sí se documenta es el paradigma de uso: el modelo formula cada pregunta como una decisión sobre el texto de entrada, soportando tres tipos de pregunta —`noul` (sí/no, devuelve P(yes)), `choice` (elección múltiple, devuelve la opción más probable con probabilidad por opción) y `score` (puntuación ordinal, devuelve el nivel esperado y confianza)—. Una sola petición puede plantear varias preguntas sobre el mismo texto, que se lee una única vez.

Sobre el entrenamiento, la model card indica que ninguno de los textos de las tareas de evaluación se usó para entrenar jevos, aunque cinco de los seis conjuntos de evaluación sirvieron para elegir el checkpoint publicado. No se especifican el número de tokens de entrenamiento, la composición del corpus ni si hubo RLHF o DPO. La distribución en OpenVINO INT8 y GGUF sugiere un proceso de conversión y cuantización orientado a inferencia en CPU, sin decodificación especulativa ni mecanismos de atención lineal documentados.

## Capacidades

- Clasificación zero-shot de texto mediante preguntas en lenguaje natural.
- Preguntas de sí/no con devolución de probabilidad (`noul`).
- Elección múltiple entre criterios definidos por el usuario (`choice`), con probabilidad por opción.
- Puntuación ordinal (`score`) con nivel esperado, útil para medir intensidad o gravedad.
- Múltiples preguntas por petición sobre el mismo texto, leído una sola vez.
- Devolución de un campo `confidence` para derivar casos dudosos a revisión humana.
- Ejecución local en CPU, sin Python y sin conexión a la nube, mediante un único binario.
- API HTTP compatible con el formato de cable del SDK de Jev (`POST /v1/systemone`).
- Soporte de llama.cpp y herramientas derivadas mediante los ficheros GGUF.
- Capacidad multilingüe: no disponible (solo inglés declarado).

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el mensaje del cliente y una pregunta `choice` con criterios como facturación, envíos o soporte técnico, y devuelve el equipo más probable con su probabilidad; si la confianza es baja, el ticket se deriva a una persona.
- Aplicación de políticas de admisión o alquiler: con una pregunta `noul` que incluye la regla en el enunciado, el modelo devuelve P(yes) para decidir si un caso cumple la política, con latencia de decenas de milisegundos por consulta.
- Moderación y triaje de mensajes: preguntas `score` sobre el tono o la gravedad de un mensaje permiten priorizar colas de revisión sin invocar un LLM generativo.
- Agentes y bucles de decisión: al responder en decenas de milisegundos en CPU, puede integrarse como paso de decisión dentro de agentes que necesitan muchas evaluaciones rápidas por segundo, como demuestra el ejemplo del juego Snake de la model card.
- Procesamiento por lotes en local: clasificación de grandes volúmenes de documentos o correos en máquinas sin GPU, usando los GGUF con llama.cpp o el modelo OpenVINO con el binario `jev`.
- Automatización de back office: extracción de decisiones binarias (¿es fraude?, ¿requiere revisión?, ¿cumple la cláusula?) con la regla escrita directamente en la pregunta, y cálculo de sumas o agregaciones en código a partir de las probabilidades.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse íntegramente en el dispositivo, los textos no salen de la máquina, lo que encaja en sectores con requisitos de confidencialidad.

## Benchmarks y rendimiento

Datos publicados en la model card. La latencia es la mediana de 10 peticiones en un portátil con Intel Core Ultra 7 255H, 16 hilos, leyendo cada texto desde cero.

| Metrica | jevos-v4 | Jev (nube) | Qwen3.5-4B | Laya |
|---|---:|---:|---:|---:|
| Latencia peticion corta (ms) | 28 | 311 | 3.060 | 129 |
| Latencia peticion larga (ms) | 130 | 314 | 4.761 | 480 |
| Admission policy (accuracy) | 0,95 | 1,00 | 0,82 | 0,54 |
| Rental policy (accuracy) | 0,76 | 0,91 | 0,60 | 0,31 |
| Rules and scenarios (accuracy) | 0,76 | 0,88 | 0,72 | 0,55 |
| Authority rules (accuracy) | 0,81 | 0,98 | 0,78 | 0,64 |
| Fraud points (accuracy) | 0,50 | 0,69 | 0,45 | 0,25 |
| Patent phrases (accuracy) | 0,37 | 0,59 | 0,18 | 0,32 |

## Requisitos de hardware

- Inferencia en CPU exclusivamente; el binario `jev` no requiere GPU ni Python.
- El modelo OpenVINO INT8 está pensado para ejecutarse con el binario oficial en Windows, Linux y macOS sobre Apple silicon.
- Los GGUF Q4_K_M y Q8_0 permiten despliegue con llama.cpp y herramientas construidas sobre él; el tamaño del repositorio completo es de 2,3 GB.
- VRAM estimada para GPU: no disponible (no es el objetivo del modelo); la memoria RAM necesaria no se detalla en la información proporcionada.
- Cabe en cualquier portátil moderno, como demuestra la medición sobre un Intel Core Ultra 7 255H.
- Opciones de despliegue: binario `jev serve` (API HTTP en el puerto 8017 por defecto), llama.cpp con los GGUF y el modelo OpenVINO.
- Latencia medida: 28 ms en peticiones cortas y 130 ms en largas; el throughput no se detalla.

## Comparativa con modelos similares

| Criterio | jevos-v4 | Jev (API en nube) | Laya |
|---|---|---|---|
| Preguntas sí/no | Sí | Sí | Sí |
| Elección múltiple | Sí | Sí | Sí |
| Puntuaciones | Sí (en fase temprana) | Sí | Sí |
| Ejecución | Máquina local | Nube | Máquina local |
| Coste | Gratuito | Por token | Gratuito |
| Contexto | 8.192 tokens | No indicado | 512 tokens |
| Licencia | MIT | No disponible | No disponible |
| Precisión en tareas difíciles | Menor que Jev | Mayor | Menor |

Frente a Qwen3.5-4B, jevos-v4 es entre dos y tres órdenes de magnitud más rápido en CPU y obtiene mejor precisión en cinco de las seis tareas evaluadas, aunque con un enfoque distinto (clasificación frente a generación).

## Limitaciones y advertencias

- Precisión limitada en tareas difíciles: 0,50 en detección de puntos de fraude y 0,37 en frases de patentes, frente a 0,69 y 0,59 de la API en nube de Jev.
- El propio autor recomienda validar el modelo con las preguntas propias antes de confiar en él en producción.
- Solo soporta inglés; no hay capacidades multilingües declaradas.
- No es un modelo generativo: no produce texto libre, solo probabilidades y etiquetas sobre preguntas predefinidas.
- La funcionalidad de puntuaciones (`score`) se describe como "early", es decir, en fase temprana.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de calibración incorrecta de probabilidades en dominios alejados de los datos de evaluación.
- La confianza devuelta debe usarse para derivar casos dudosos a revisión humana; no se documentan umbrales recomendados.
- Licencia MIT, que permite uso comercial sin restricciones documentadas; conviene conservar el aviso de copyright.
- No se detallan sesgos conocidos ni la composición del dataset de entrenamiento, lo que dificulta auditar su comportamiento en dominios sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/feder-cr/jev
- Repositorio en GitHub: https://github.com/feder-cr/jev
- Release jevos-v4 (binarios y SHA256SUMS): https://github.com/feder-cr/jev/releases/tag/jevos-v4
- README del proyecto: https://github.com/feder-cr/jev#readme
- Wiki con guías y mediciones: https://github.com/feder-cr/jev/wiki
- Vídeo comparativo jevos vs Jev: https://huggingface.co/feder-cr/jev/resolve/main/assets/jevos_vs_jev_snake.mp4
- Perfil del autor: https://github.com/feder-cr

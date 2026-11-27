# kabachuha/DeepSeek-V4.1-Flash-1017-control-vectors

## Resumen

DeepSeek-V4.1-Flash-1017-control-vectors es una colección de vectores de control (control vectors) para el modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017, publicada por el usuario kabachuha. No se trata de un modelo de lenguaje con pesos propios, sino de un conjunto de adaptadores de direccionamiento de activaciones (activation steering) que permiten modificar el comportamiento del modelo base sin reentrenarlo. Cada vector desplaza las activaciones internas del modelo en una dirección semántica concreta, de modo que al aplicarlo con una intensidad determinada se altera el tono narrativo, el foco del personaje o el estilo de escritura de las respuestas generadas.

El paquete está orientado a escritura creativa, roleplay y narración, e incluye ejes como optimismo frente a nihilismo, empatía frente a sociopatía, honestidad frente a maquiavelismo, humildad frente a narcisismo y un eje de lenguaje simple frente a ornamentado. Los vectores se han construido a partir de varios cientos de tripletas de ejemplo (256 por eje, 512 para la variante refinada de nihilismo), por debajo de las ~4000 recomendadas, lo que el autor reconoce que puede introducir algo de ruido.

La relevancia de esta publicación es doble: por un lado, ofrece una vía práctica y ligera para controlar el estilo de un modelo grande sin fine-tuning; por otro, es un ejemplo de interpretabilidad mecanicista aplicada, ya que los vectores se calibran contra una versión "debiased" del modelo y deben aplicarse junto con ella. El repositorio tiene un tamaño de 0,0 GB, lo que confirma que solo contiene los vectores y no los pesos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vectores de control (activation steering) sobre el modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017 |
| Parametros totales | 194.560 (según safetensors del repositorio; corresponden a los vectores, no al modelo base) |
| Parametros activos | no disponible (no es un modelo MoE; el modelo base no se detalla en la información) |
| Longitud de contexto | no disponible para los vectores; el ejemplo de configuración de Project Maya usa `--max-context 1048576` para el modelo base |
| Tipos de cuantizacion | GGUF (los vectores se distribuyen en formato GGUF) |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (vectores); el modelo base se referencia en formato GGUF y safetensors en el ecosistema |

## Arquitectura y entrenamiento

Los control vectors son direcciones en el espacio de activaciones de un transformer que, sumadas a las activaciones de ciertas capas durante la inferencia, desplazan la distribución de salida hacia un comportamiento deseado. En este caso, cada eje se construye a partir de tripletas de ejemplo contrastivas (positivo, negativo y neutro) y se calibra contra una versión "debiased" del modelo base, de modo que el vector de debias debe aplicarse siempre junto con el vector positivo o negativo correspondiente, con intensidad 1.0, para que la intervención sea coherente. Los vectores no se aplican solos: el autor insiste en que el debias y el eje elegido se usan en pareja.

El entrenamiento no emplea RLHF ni DPO, sino un procedimiento de extracción de direcciones a partir de ejemplos. La mayoría de los ejes se han construido con 256 tripletas; el eje de nihilismo dispone de dos variantes, una de 128 tripletas (sufijo "fuzzy", algo ruidosa) y otra de 512 (recomendada, más refinada pero con menos grados de libertad). El autor advierte que el eje de sadismo quedó contaminado con la dirección de rechazo del modelo base y que, al aplicarlo, reintroduce rechazos en las respuestas, por lo que no recomienda su uso hasta que se corrija; sugiere ortogonalizarlo contra la dirección de rechazo. La integración práctica se ha probado en un fork personal de Project Maya y se espera compatibilidad con la versión principal de Project Maya y con llama.cpp, aunque no se ha verificado.

## Capacidades

- Modulación del tono narrativo mediante ejes de optimismo/nihilismo, empatía/sociopatía, honestidad/maquiavelismo y humildad/narcisismo.
- Alteración del registro lingüístico con el eje de lenguaje simple frente a ornamentado.
- Ajuste experimental del tono afectivo en conversación directa y en roleplay con el eje warm_vs_moralizing.
- Aplicación de los conceptos de los vectores a dominios distintos de la escritura, como la generación de SVG o temas de interfaz, según los ejemplos del autor.
- Compatibilidad con flujos de escritura creativa y roleplay multi-turno sobre el modelo base.
- No incluye tool calling, function calling ni capacidades de agente propias; estas dependerían del modelo base.
- Capacidades multilingües limitadas al inglés según la model card.
- No dispone de modo thinking, visión ni audio propios; son características del modelo base si las tuviera.

## Casos de uso

- Roleplay narrativo con control de tono: aplicar el eje de optimismo o nihilismo con una intensidad concreta (por ejemplo, 1.5) para que un personaje pase de una actitud esperanzada a una visión sombría sin cambiar el modelo ni el prompt de sistema.
- Escritura de ficción oscura: usar la variante refinada de nihilismo (512 tripletas) para generar relatos con un tono pesimista coherente, teniendo en cuenta que el modelo base ya es negativo y que la amplificación puede ser intensa.
- Creación de personajes antagónicos: combinar el eje de maquiavelismo con el de narcisismo para construir villanos con motivaciones manipuladoras y egocéntricas, ajustando cada eje por separado para calibrar el matiz.
- Estilización de prosa: aplicar el eje de lenguaje simple frente a ornamentado para adaptar un mismo texto a un registro periodístico directo o a una prosa barroca, útil en tareas de reescritura y edición.
- Asistencia a guionistas y escritores: probar variantes de una misma escena con distintos ejes de personalidad para explorar rápidamente direcciones narrativas antes de fijar el borrador.
- Investigación en interpretabilidad: usar los vectores como herramienta experimental para estudiar cómo direcciones de activación concretas se correlacionan con rasgos de personalidad y estilo en las respuestas, y para analizar fenómenos como la contaminación con la dirección de rechazo.
- Ajuste de experiencias conversacionales en SillyTavern: aplicar el eje warm_vs_moralizing a baja intensidad (0.5) para que los roleplays resulten más cálidos y cohesionados en lugar de fragmentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para los vectores; dependen por completo del modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el ejemplo de configuración de Project Maya usa `--tp 2`, lo que sugiere despliegue en al menos dos dispositivos, pero no se especifica el modelo de GPU.
- Opciones de despliegue: Project Maya (fork personal del autor y versión principal con `--control-vector-scaled`), llama.cpp y backends dedicados a DeepSeek V4.1 según el autor, aunque la compatibilidad con estos últimos no se ha probado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kabachuha/DeepSeek-V4.1-Flash-1017-control-vectors | Vectores de control sobre DeepSeek V4.1 Flash 1017 | 194.560 (vectores) | no disponible (modelo base con 1.048.576 en el ejemplo) | cc-by-4.0 | Hugging Face, 1.553 descargas, 7 likes |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | Modelo base de lenguaje | no disponible | no disponible | no disponible | Hugging Face (referenciado como base) |
| Project Maya | Backend de inferencia con soporte de control vectors | no aplica | no disponible | no disponible | Repositorio de GitHub |

No se dispone de información sobre otros conjuntos de control vectors comparables ni sobre resultados de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Los vectores se han construido con varios cientos de tripletas en lugar de las ~4000 recomendadas, por lo que pueden presentar ruido; el autor lo reconoce explícitamente.
- El eje de sadismo está contaminado con la dirección de rechazo del modelo base: al aplicarlo se reintroducen rechazos, y no se recomienda su uso hasta que se corrija.
- El debias vector debe aplicarse siempre junto con el eje positivo o negativo, con intensidad 1.0; usarlos por separado o aplicar ambos ejes a la vez hace que se anulen entre sí.
- El modelo base es descrito por el autor como muy negativo y anti-sicofántico; amplificar rasgos no positivos como el nihilismo puede producir contenido NSFL de forma intensa.
- El eje warm_vs_moralizing es experimental: en chat directo solo muestra efecto a intensidades de 1.5 a 2.5, y a 2.5 rompe la coherencia.
- La licencia cc-by-4.0 permite uso comercial con atribución, pero el uso queda condicionado a la licencia y restricciones del modelo base, que no se detallan en la información.
- El soporte de idiomas se limita al inglés según la model card.
- La compatibilidad con llama.cpp y backends dedicados de DeepSeek V4.1 no se ha probado; solo se ha verificado en el fork personal de Project Maya.
- En Project Maya, el argumento `--control-vector-scaled` debe añadirse al archivo de configuración JSON y no al script de arranque, ya que este último sobrescribe la configuración.
- Riesgo de alucinación y sesgos: no se documentan sesgos específicos de los vectores más allá de los rasgos que modelan; el riesgo de alucinación depende del modelo base.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kabachuha/DeepSeek-V4.1-Flash-1017-control-vectors
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Fork de Project Maya usado para crear los vectores: https://github.com/kabachuha/project-maya/tree/cvector-creator-ds4
- Project Maya (repositorio original de mw00): no disponible en la información proporcionada

# liamsi/tiny-dlms-melon-car-small

## Resumen

Mēlon 2x64 (car) es un modelo de decisión de tamano muy reducido desarrollado por liamsi como parte del proyecto tiny-dlms. Su funcion no es generar texto, sino recibir una imagen (un fotograma de 48x48 píxeles del entorno CarRacing-v3) y elegir una entre 15 opciones de conduccion descritas en texto, puntuando todas ellas de forma simultanea mediante una softmax que devuelve una probabilidad por opcion. No hay generacion autoregresiva: el modelo clasifica opciones.

El modelo se ha escrito y entrenado desde cero en PyTorch, sin usar la libreria `transformers` de Hugging Face, incluyendo el tokenizador, el Transformer y el bucle de entrenamiento. Es un proyecto didactico y de investigacion, no un modelo de produccion, segun indica el propio autor. Con solo 212.928 parametros y 3.500 pasos de entrenamiento, demuestra que un Transformer minúsculo con vision por parches puede igualar a un profesor basado en reglas (pure pursuit) en el entorno CarRacing-v3.

Es relevante ahora como ejemplo reproducible de imitacion visual con arquitecturas modernas (RMSNorm, RoPE, SwiGLU) a escala minima, util para estudiar decision-making multimodal sin grandes recursos de computo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo vision con parches, 2 capas x 64 de ancho (4 cabezas) + 1 capa de atencion entre opciones |
| Parametros totales | 212.928 (0,21 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada fija de 36 parches de 8x8 sobre imagen 48x48) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precision de entrenamiento) |
| Idiomas soportados | no disponible (las opciones son texto en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Entrada | imagen a color 48x48 (redimensionada desde 96x96), 36 parches de 8x8 |
| Bloques | RMSNorm, RoPE, SwiGLU |
| Pasos de entrenamiento | 3.500 |
| Opciones de salida | 15 acciones de conduccion predefinidas |
| Libreria | tiny-dlms (PyTorch, sin transformers) |

## Arquitectura y entrenamiento

El modelo es un Transformer minúsculo con dos capas de 64 dimensiones y 4 cabezas de atencion, seguido de una capa adicional en la que las representaciones de las opciones de texto se atienden entre si para puntuar cada alternativa. La imagen de entrada (96x96 original, reducida a 48x48) se divide en 36 parches de 8x8. Emplea RMSNorm, codificacion posicional rotatoria (RoPE) y activaciones SwiGLU, innovaciones propias de modelos grandes aplicadas a escala minima. La salida es una distribucion softmax sobre las 15 opciones de conduccion, sin decodificacion autoregresiva.

El entrenamiento es por imitacion (imitation learning): el modelo copia a un profesor de tipo pure pursuit que condujo por 45 pistas, con fotogramas grabados mediante `scripts/car_record.py`. Se realizaron 3.500 pasos de entrenamiento. No se menciona uso de RLHF, DPO ni datos de texto a gran escala; el tokenizador y el Transformer se escribieron desde cero en PyTorch.

## Capacidades

- Decision visual: recibe un fotograma de CarRacing-v3 y selecciona una de 15 acciones de conduccion (combinaciones de giro y aceleracion, mas frenar).
- Puntuacion simultanea de opciones: calcula probabilidades para todas las opciones a la vez mediante softmax, sin generacion secuencial.
- Percepcion por parches: procesa imagenes a color de 48x48 divididas en 36 parches de 8x8.
- Imitacion de politicas: reproduce el comportamiento de un profesor pure pursuit.
- No soporta tool calling, function calling, agentes multi-paso, vision general, audio ni modo thinking.
- Capacidades multilingues: no disponibles; las opciones estan en ingles.
- No es un modelo de lenguaje: no genera texto libre.

## Casos de uso

- Investigacion educativa sobre Transformers: sirve para estudiar como RMSNorm, RoPE y SwiGLU funcionan a escala minima, con codigo PyTorch legible y reproducible desde cero.
- Reproduccion de experimentos de imitation learning: permite replicar el pipeline completo (grabacion de pistas, entrenamiento, evaluacion) con recursos minimos y validar resultados frente al profesor pure pursuit.
- Benchmark de decision visual: util como referencia base para comparar arquitecturas de decision sobre imagenes en CarRacing-v3, dado su tamano de 0,21 M parametros.
- Prototipado de agentes para entornos Gymnasium: se integra con `gymnasium[box2d]` y `tiny_dlm.car` para probar politicas de conduccion en segundos.
- Demostracion de destilacion de politicas basadas en reglas: muestra como un modelo neuronal pequeno puede igualar (puntuacion 913) a un profesor heuristico.
- Docencia y talleres: ejemplo completo de tokenizador, Transformer y entrenamiento escritos a mano, adecuado para cursos de deep learning.
- Generacion de videos de evaluacion: el script `scripts/car_drive.py` graba videos de conduccion autonoma para inspeccion cualitativa.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 5 pistas no vistas en CarRacing-v3:

| Conductor | Puntuacion media |
|---|---|
| Este modelo | 913 |
| Profesor (pure pursuit) | 913 |
| Siempre recto | -26 |
| Aleatorio | -40 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el modelo no es de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 0,21 M parametros los pesos ocupan menos de 1 MB en precision de entrenamiento.
- GPU recomendadas: cualquier GPU, incluida CPU; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer e incluso en Raspberry Pi o ejecucion en CPU.
- Opciones de despliegue: inferencia directa con PyTorch mediante la libreria `tiny-dlms` (`from_pretrained`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano, la latencia por fotograma es despreciable en cualquier hardware moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-dlms-melon-car-small (este) | 0,21 M | Decision visual en CarRacing-v3 | Entrada fija 48x48 | MIT | Hugging Face |
| tiny-dlms-melon-car | no disponible | Decision visual en CarRacing-v3 | no disponible | MIT | Hugging Face |
| tiny-dlms-melon-maze | no disponible | Resolucion de laberintos desde pixeles | no disponible | MIT | Hugging Face |
| tiny-dlms-rhoa | no disponible | Modelo de lenguaje (preentrenado en 2 GB de texto web) | no disponible | MIT | Hugging Face |

Los modelos de la familia tiny-dlms comparten filosofia (desde cero, PyTorch, escala minima) pero difieren en tarea. No se dispone de datos de benchmarks comparativos entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de juguete: el autor lo describe explicitamente como proyecto de aprendizaje, no de produccion.
- Dominio muy restringido: solo funciona en CarRacing-v3 con fotogramas de 48x48 y las 15 opciones predefinidas.
- No generaliza a otras tareas, idiomas ni entradas de imagen arbitrarias.
- Riesgo de sobreajuste a las 45 pistas del profesor; el rendimiento en pistas no vistas se limita a la evaluacion reportada (5 pistas).
- No es un modelo de lenguaje: no genera texto, no responde preguntas ni soporta tool calling.
- Sesgos: hereda los sesgos del profesor pure pursuit y de las pistas de entrenamiento.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero puede elegir acciones erroneas en situaciones no vistas.
- Licencia MIT permite uso comercial, pero el modelo no es adecuado para ello por sus limitaciones funcionales.
- Idiomas: las opciones estan en ingles; no hay soporte multilingue documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liamsi/tiny-dlms-melon-car-small
- Repositorio GitHub: https://github.com/benisalla/tiny-dlms
- Pagina del proyecto: https://benisalla.github.io/tiny-dlms/
- Modelo hermano tiny-dlms-melon-car: https://huggingface.co/liamsi/tiny-dlms-melon-car
- Modelo hermano tiny-dlms-melon-maze: https://huggingface.co/liamsi/tiny-dlms-melon-maze
- Modelo tiny-dlms-rhoa: https://huggingface.co/liamsi/tiny-dlms-rhoa
- Modelo tiny-dlms-rhoa-small: https://huggingface.co/liamsi/tiny-dlms-rhoa-small
- Modelo tiny-dlms-rhoa-gpt2: https://huggingface.co/liamsi/tiny-dlms-rhoa-gpt2
- Modelo tiny-dlms-rhoa-base: https://huggingface.co/liamsi/tiny-dlms-rhoa-base

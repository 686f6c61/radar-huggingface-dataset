# Godog2026/connectailab-rl-connectailab-rl-kiwi-v1

## Resumen

Este repositorio contiene un adaptador LoRA denominado kiwi-v1, desarrollado por Godog2026 en el marco de la colaboración entre CONNECT AI LAB y AI CITY BUILDERS, sobre el modelo base Qwen/Qwen3.5-0.8B. No es un modelo completo, sino un ajuste fino PEFT orientado a una tarea muy concreta: leer un problema de decisión empresarial compuesto por un estado, una pregunta y una lista de opciones etiquetadas, y devolver una única letra correspondiente a la opción elegida. El problema que aborda es el de automatizar la toma de decisiones mes a mes dentro de un simulador de gestión de empresa (CONNECT TYCOON).

El interés técnico del trabajo radica en su metodología de entrenamiento, que combina aprendizaje por refuerzo en un simulador, destilación mediante etiquetas generadas por una política profesora entrenada con PPO, ajuste supervisado y un paso final de RL con ventaja normalizada por grupo (enfoque tipo GRPO) más penalización KL respecto al modelo de partida. Los autores reportan que el ajuste supervisado eleva la precisión del 33,7 % al 83,2 % y que el paso de RL mantiene la precisión (82,9 %) reduciendo la métrica de arrepentimiento de 3,20 a 3,14.

El modelo es de ámbito muy restringido: 0,8 mil millones de parámetros en el modelo base, soporte únicamente del idioma coreano y salida de un solo carácter. Su relevancia es mayormente educativa y de investigación sobre RL aplicado a decisiones, no como generador de texto de propósito general. El propio autor advierte que se trata de un modelo sintético y educativo que debe revalidarse con datos reales antes de cualquier uso en gestión empresarial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only (Qwen/Qwen3.5-0.8B) |
| Parametros totales | Modelo base de ~0,8 mil millones de parametros; adaptador LoRA de tamano no especificado (repo de 0,0 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no declarada en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible para el adaptador (pesos en safetensors); el modelo base admitiria cuantizacion, pero no se documenta |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,8 mil millones de parametros. No se modifica ni se publica el modelo base completo, sino unicamente los pesos del adaptador, lo que reduce drásticamente el tamano del repositorio. La tarea modelada es de clasificacion restringida: dado un JSON con estado, pregunta y opciones etiquetadas, el modelo debe emitir exactamente una letra, y la probabilidad asignada a cada letra se interpreta como probabilidad de eleccion.

El entrenamiento sigue cuatro fases documentadas por el autor. Primero se entrena una politica pequena mediante PPO que opera la empresa simulada durante miles de meses; esta politica actua como profesora. Segundo, se genera un conjunto de problemas reejecutando cada mes del simulador variando la opcion elegida para puntuar cada alternativa. Tercero, se realiza aprendizaje supervisado imitando la opcion de mayor puntuacion. Cuarto, se aplica aprendizaje por refuerzo con ventaja normalizada por grupo (estandarizacion del grupo de opciones) mas una penalizacion KL contra el modelo de partida. El conjunto de datos consta de 4.082 ejemplos de entrenamiento, 832 de validacion y 840 de prueba, sobre una distribucion de empresa de tipo general, ajustada con datos publicos.

## Capacidades

- Toma de decisiones de opcion multiple en el dominio del simulador CONNECT TYCOON: recibe un estado, una pregunta y varias opciones, y devuelve una unica letra.
- Salida calibrada en forma de distribucion de probabilidad sobre las opciones, donde el valor maximo representa la confianza de la eleccion.
- Manejo de instrucciones estrictas de sistema que delimitan el texto de estado como datos y no como instrucciones, con el fin de mitigar inyeccion de prompt.
- Capacidad de operar una empresa simulada durante meses consecutivos, reportando en las pruebas un beneficio medio mensual de 8,79 millones de wones y una reduccion del 66 % (137 de 177) en perdidas por transacciones con tarjeta.
- Soporte limitado al idioma coreano (ko).
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso general, vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Investigacion en aprendizaje por refuerzo aplicado a decisiones: el modelo sirve como caso de estudio reproducible (con cuaderno de Colab) de un pipeline completo de PPO, destilacion, aprendizaje supervisado y RL con ventaja por grupo.
- Simulacion de agentes economicos en entornos tipo Gymnasium: puede conectarse a un entorno de simulacion de empresa para que actue como politica de decision mes a mes.
- Evaluacion comparativa de tecnicas de alineacion: permite medir el efecto del aprendizaje supervisado frente al RL sobre la precision y el arrepentimiento en una misma tarea.
- Docencia y formacion en RL: sirve como ejemplo practico y de tamano reducido para cursos de refuerzo, dado que corre en hardware de consumo.
- Generacion de etiquetas sinteticas de decision dentro del simulador: sus elecciones pueden usarse para poblar conjuntos de datos de entrenamiento o de evaluacion en el dominio de gestion simulada.
- Pruebas de robustez frente a inyeccion de prompt: al tratar el estado como datos, es util para estudiar defensas frente a instrucciones maliciosas embebidas en el contexto.
- Prototipado de asistentes de decision acotados: en escenarios donde la decision se reduce a elegir entre opciones predefinidas, el modelo ofrece una salida discreta y facil de parsear.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (tarea: problemas de decision del simulador):

| Modelo | Precision en test | Arrepentimiento (menor es mejor) | Beneficio mensual en simulador | Reduccion de perdidas en transacciones reales |
|---|---|---|---|---|
| Qwen antes del ajuste | 33,7 % | 4,76 | No disponible | No disponible |
| Ajuste supervisado | 83,2 % | 3,20 | No disponible | No disponible |
| Ajuste con RL | 82,9 % | 3,14 | 8,79 millones de wones | 66 % (137/177) |

El autor advierte que se trata de un primer experimento, que la evaluacion de operacion empresarial se basa en una media de dos meses no vistos (muestra pequena) y que el modelo sigue por debajo de la politica profesora entrenada con PPO en el simulador. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision de 16 bits el modelo base de 0,8 mil millones de parametros ocupa aproximadamente 1,6 GB de pesos, por lo que cabria en torno a 2-3 GB con sobrecarga; en cuantizacion de 8 bits alrededor de 0,8-1,5 GB; en 4 bits en torno a 0,5-1 GB. Estimaciones orientativas basadas en el tamano del modelo base, no confirmadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM debe bastar en 16 bits; una RTX 3060, RTX 4060, RTX 4090 o similar son sobradamente suficientes. GPU de datacenter (A100, H100) solo tendrian sentido para servir muchas replicas concurrentes.
- Cabe en GPU de consumo: si, incluso en tarjetas de gama baja con 6-8 GB de VRAM.
- Opciones de despliegue: transformers con PEFT (metodo documentado por el autor), servidores compatibles con adaptadores LoRA como vLLM o TGI, y, previa fusion del adaptador con el modelo base, conversion a GGUF para llama.cpp u Ollama. La model card solo documenta el uso mediante transformers y PEFT.
- Latencia y throughput: no disponibles. Por el tamano del modelo base, se espera una latencia baja, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-kiwi-v1 (este) | Base ~0,8B + LoRA | No disponible | 82,9 % precision, 3,14 de arrepentimiento | Apache 2.0 | Adaptador LoRA en HuggingFace |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | No disponible | 33,7 % precision, 4,76 de arrepentimiento | No disponible en la informacion | Modelo base en HuggingFace |
| Politica profesora PPO del simulador | No disponible | No disponible | Por encima del modelo ajustado segun el autor | No disponible | No publicada como modelo independiente |

No se dispone de informacion sobre otros modelos de decision comparables en el mismo dominio, por lo que la comparativa se limita al modelo base y a la politica profesora mencionada por el autor.

## Limitaciones y advertencias

- Sesgos: la distribucion de empresas del simulador se ajusta con datos publicos y se etiqueta como general; no se documenta analisis de sesgos por sector, region o colectivo.
- Riesgo de alucinacion: al tratarse de una tarea de eleccion cerrada, la salida se restringe a una letra, pero una eleccion de baja confianza puede ser incorrecta sin que el modelo lo advierta; la probabilidad de la opcion elegida es el unico indicador de confianza.
- Limitaciones de contexto e idioma: solo soporta coreano y no se declara la longitud de contexto; el autor recomienda tratar el texto de estado como datos para evitar inyeccion de prompt.
- Restricciones de licencia: el adaptador se publica bajo Apache 2.0, pero la licencia del modelo base Qwen/Qwen3.5-0.8B debe verificarse de forma independiente antes de un uso comercial.
- Ambito y validez: es un modelo sintetico y educativo entrenado en un simulador; la propia model card advierte que, antes de usarlo para decisiones de gestion reales, debe revalidarse con los registros historicos de la empresa concreta.
- Evidencia limitada: la evaluacion de operacion empresarial se basa en dos meses no vistos, muestra pequena segun el propio autor, y el rendimiento queda por debajo de la politica profesora en el simulador.
- Madurez: el repositorio registra 0 descargas y 0 me gusta en el momento de la consulta, sin historial de uso externo ni resultados de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Godog2026/connectailab-rl-connectailab-rl-kiwi-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio del simulador CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de aprendizaje por refuerzo (AI CITY BUILDERS): https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Servicio ALBAKNOW: https://albaknow.com/
- Servicio MEETORY: https://meetory.kr/

# jchann00/connectailab-rl-jcan-v2

## Resumen

Connectailab-rl-jcan-v2 es un adaptador LoRA de tipo PEFT publicado por el usuario jchann00 (canal CONNECT AI LAB, Corea del Sur) sobre el modelo base Qwen/Qwen3.5-0.8B. No es un modelo de proposito general: es un modelo de decision multiple-choice que recibe una situacion, una pregunta y una lista de opciones etiquetadas, y devuelve unicamente la letra de la opcion elegida. La probabilidad asignada a cada letra se interpreta como la confianza del modelo en esa opcion.

El modelo se entrena con un pipeline de cuatro fases sobre el simulador Connect Tycoon (gestion de una empresa sintetica): una politica pequena entrenada con PPO actua como profesor, se genera un "cuaderno de problemas" reevaluando contrafactualmente cada decision, se aplica aprendizaje supervisado sobre la opcion de mayor puntuacion y, finalmente, un paso de aprendizaje por refuerzo tipo GRPO con normalizacion por grupo y termino KL respecto al modelo de partida. El conjunto de datos resultante tiene 4.082 ejemplos de entrenamiento, 832 de validacion y 840 de test.

Su relevancia es acotada y experimental: es un caso de estudio de como alinear un LLM pequeno (0,8 mil millones de parametros) con senales de un entorno Gymnasium para tareas de decision restringida, con licencia Apache 2.0 y pesos publicados como adaptador. El autor lo describe explicitamente como modelo de investigacion y uso educativo sobre un simulador sintetico, no como sistema listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen/Qwen3.5-0.8B) con adaptador LoRA via PEFT |
| Parametros totales | 0,8 mil millones en el modelo base; numero de parametros del adaptador LoRA no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponibles para el adaptador; el modelo base puede cargarse en fp16, int8 o int4 con bitsandbytes, pero el autor no documenta ninguna configuracion de cuantizacion |
| Idiomas soportados | coreano (ko) declarado en la model card; las instrucciones del sistema estan en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT); no se publican pesos fusionados ni GGUF |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Libreria | peft |
| Pipeline declarado | reinforcement-learning |
| Tamano del repositorio | 0,0 GB segun HuggingFace |
| Dataset de entrenamiento | 4.082 train / 832 valid / 840 test; distribucion de empresa: general |
| Fecha de publicacion | 15 de octubre de 2026 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,8 mil millones de parametros. Sobre el se entrena un adaptador LoRA, de modo que el artefacto publicado no contiene pesos completos sino las matrices de bajo rango que modifican las capas del base. El espacio de salida efectivo se restringe a la letra de una opcion (A, B, C, ...), de forma que la distribucion de probabilidad sobre las letras funciona como una politica de decision.

El entrenamiento sigue cuatro etapas descritas por el autor: (1) una politica pequena se entrena en el simulador Connect Tycoon con PPO y actua como profesor; (2) para cada mes simulado se genera un problema reevaluando la misma decision con cada opcion alternativa y dejando correr el mes hasta el final, lo que produce una puntuacion por opcion; (3) aprendizaje supervisado imitando la opcion de mayor puntuacion; (4) aprendizaje por refuerzo que trata el conjunto completo de opciones como un grupo, normaliza la ventaja dentro del grupo y aumenta la probabilidad de las opciones cuyo resultado en el simulador supera la media, con un termino de divergencia KL respecto al modelo de partida. No se especifica el numero de tokens de entrenamiento, la composicion detallada del corpus ni si se aplicaron tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Seleccion multiple restringida: dado un estado, una pregunta y un conjunto de opciones etiquetadas, devuelve una unica letra como respuesta.
- Calibracion de confianza por opcion: la probabilidad asignada a cada letra puede leerse como una estimacion de preferencia entre alternativas.
- Toma de decisiones secuencial en entornos tipo Gymnasium, integrable como politica dentro de un bucle de simulacion.
- Comprension de texto en coreano aplicado a contextos de gestion empresarial simulada (finanzas, satisfaccion, incidentes).
- Tratamiento de datos como contenido no ejecutable: el prompt de sistema indica explicitamente que el texto dentro del estado debe tratarse como datos y no como instrucciones.
- No dispone de tool calling, function calling, uso de agentes multi-paso, vision, audio, ni modo de razonamiento extendido segun la informacion disponible.
- Multilinguee: solo se declara coreano; no hay evidencia de capacidades en castellano.

## Casos de uso

- Investigacion en aprendizaje por refuerzo para LLM pequenos: sirve como implementacion de referencia de un pipeline SFT + GRPO con ventaja normalizada por grupo y KL, reproducible sobre un modelo de 0,8B en una unica GPU.
- Generacion de datos de decision etiquetados: el modelo puede etiquetar estados simulados con la opcion preferida, util para preentrenar o evaluar politicas mayores en el mismo entorno Connect Tycoon.
- Simuladores educativos de gestion empresarial: integrado en Connect Tycoon o en un simulador propio, permite que un agente automatico juegue partidas completas y genere trayectorias para analisis didactico.
- Evaluacion de agentes en entornos de decision restringida: al emitir una letra unica, elimina problemas de formato y facilita metricas objetivas de acierto y arrepentimiento en bancos de prueba de opcion multiple.
- Investigacion sobre alineacion de politicas con senales de entorno: util para estudiar cuanto de la ganancia de una politica PPO pequena se transfiere a un LLM mediante destilacion y RL, y donde se pierde.
- Prototipado de asistentes de decision de bajo coste: por su tamano, puede desplegarse en local para explorar flujos de "recomendar una accion entre N" antes de invertir en un modelo mayor.
- Docencia y talleres de RL aplicado: el autor publica un notebook de Colab, de modo que el modelo sirve como material practico para cursos de reinforcement learning con LLM.
- Validacion cruzada con registros reales: el autor reporta una prueba sobre transacciones reales con tarjeta (145 de 177 casos con reduccion de perdidas), util como ejemplo de metodologia de transferencia de simulador a datos reales, siempre con revalidacion previa.

## Benchmarks y rendimiento

Los unicos datos disponibles son los publicados por el autor en la model card. Corresponden al examen del simulador (problemas de test), a la metrica de arrepentimiento, al beneficio mensual simulado y a una prueba sobre transacciones reales con tarjeta.

| Modelo | Tasa de acierto en el examen | Arrepentimiento (menor es mejor) | Beneficio mensual en el simulador | Reduccion de perdidas en transacciones reales con tarjeta |
|---|---|---|---|---|
| Qwen sin entrenar | 30,4% | 2,67 | no disponible | no disponible |
| Aprendizaje supervisado | 78,0% | 1,88 | no disponible | no disponible |
| Aprendizaje por refuerzo (este modelo) | 77,3% | 1,92 | 11.490.000 KRW | 71% (145/177) |

El propio autor advierte que la cifra de operacion empresarial es la media de dos meses no vistos, con muestra pequena, y que la politica profesora entrenada con PPO en el simulador sigue estando por encima del modelo publicado. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalents) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16: en torno a 1,6 GB para los pesos del modelo base de 0,8B, mas overhead de activaciones y contexto; unos 2-3 GB en la practica.
- VRAM estimada con cuantizacion: aproximadamente 0,8 GB en int8 y 0,5 GB en int4, si se cuantiza el modelo base con bitsandbytes; el autor no documenta configuraciones de cuantizacion.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente, por ejemplo RTX 3050, RTX 3060, RTX 4060 o superiores; tambien funciona en T4, A10, L4, A100 y H100 sin aprovechar su capacidad.
- Inferencia en CPU: viable por el tamano del modelo, con latencias mayores; no se publican mediciones.
- Opciones de despliegue: transformers + peft (metodo documentado por el autor), vLLM con soporte de adaptadores LoRA, llama.cpp u Ollama tras fusionar el adaptador con el base y convertir a GGUF, y TGI con adaptadores. Ninguna de estas rutas salvo transformers + peft esta documentada por el autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones de tokens por segundo ni de tiempo de respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Datos de rendimiento publicados | Disponibilidad |
|---|---|---|---|---|---|---|
| connectailab-rl-jcan-v2 | 0,8B (base) + LoRA | no disponible | Decision multiple-choice en simulador empresarial | apache-2.0 | Tabla propia de examen, arrepentimiento y prueba con tarjeta | Adaptador LoRA en HuggingFace |
| Qwen/Qwen3.5-0.8B | 0,8B | no disponible | Modelo de lenguaje general | no disponible en esta informacion | No comparable: la model card solo reporta 30,4% de acierto antes del ajuste | Pesos base en HuggingFace |
| connect-ai-lab-aimo/connectailab-rl-juju-v2 | no disponible | no disponible | Modelo de decision RL en la misma linea de trabajo | no disponible | no disponible | Adaptador en HuggingFace |

No se dispone de datos que permitan comparar este adaptador con alternativas equivalentes de decision multiple-choice de otros autores. La comparacion con modelos de proposito general de tamano similar no es significativa porque la tarea, el formato de salida y la metrica de evaluacion son distintos.

## Limitaciones y advertencias

- Entrenado sobre un simulador sintetico (Connect Tycoon) con distribucion de empresa "general"; el comportamiento fuera de esa distribucion no esta caracterizado.
- Muestra de evaluacion muy pequena: la cifra de operacion empresarial es la media de dos meses no vistos.
- Rendimiento inferior a la politica profesora entrenada con PPO en el simulador, segun reconoce el autor.
- El modelo solo responde con una letra; cualquier peticion de texto libre, explicacion o razonamiento queda fuera de su diseno y produce salidas degeneradas o invalidas.
- Idioma declarado unicamente coreano; no hay evidencia de funcionamiento correcto en castellano ni en otros idiomas.
- No se documentan datos de sesgo, composicion del corpus ni procedencia de los textos de entrenamiento, por lo que no es posible auditar sesgos.
- Riesgo de alucinacion de opciones: si el estado o las opciones contienen ruido, el modelo puede devolver una letra valida pero incorrecta sin ninguna senal de incertidumbre mas alla de la probabilidad asignada.
- El autor advierte explicitamente que es un modelo de investigacion y educacion y que debe revalidarse con los registros reales de la empresa antes de cualquier uso en decision empresarial.
- El repositorio figura con 0,0 GB de tamano y sin descargas ni likes en el momento de la consulta; conviene verificar que los pesos del adaptador estan efectivamente subidos antes de integrarlo.
- Licencia Apache 2.0: permite uso comercial, pero la responsabilidad sobre el modelo base Qwen3.5-0.8B y sus propios terminos recae en quien lo despliegue.
- No hay soporte de tool calling ni de agentes multi-paso; cualquier pipeline que lo requiera necesita un envoltorio externo que gestione el bucle.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jchann00/connectailab-rl-jcan-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio del simulador Connect Tycoon: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab para entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Perfil del autor en HuggingFace: https://huggingface.co/jchann00
- Adaptador relacionado connectailab-rl-juju-v2: https://huggingface.co/connect-ai-lab-aimo/connectailab-rl-juju-v2
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- Curso de aprendizaje por refuerzo de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Sitio de AI CITY BUILDERS: https://www.aicitybuilders.com
- Connect AI: https://www.ezerai.xyz
- Repositorio de la organizacion connectailab: https://github.com/jsunsheep/connectailab/blob/main/README.md

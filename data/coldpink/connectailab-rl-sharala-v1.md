# coldpink/connectailab-rl-sharala-v1

## Resumen

connectailab-rl-sharala-v1 es un adaptador LoRA de PEFT entrenado sobre el modelo Qwen/Qwen3.5-0.8B para resolver tareas de decisión empresarial en un simulador. El modelo recibe una situación, una pregunta y una lista de opciones, y devuelve únicamente la letra de la opción elegida. No es un modelo generativo de propósito general: es un clasificador de decisión especializado en el dominio del simulador CONNECT TYCOON, desarrollado por el autor coldpink en el marco del laboratorio CONNECT AI LAB.

El entrenamiento combina tres fases: primero se entrena una política pequeña con PPO dentro del simulador (el "profesor"), después se etiquetan decisiones con aprendizaje supervisado según la puntuación obtenida en el simulador, y finalmente se aplica aprendizaje por refuerzo con GRPO usando ventaja normalizada por grupo y una penalización KL contra el modelo de partida. El conjunto de datos declarado incluye 4.080 preguntas de entrenamiento, 828 de validación y 840 de test.

Su relevancia actual es doble: por un lado ilustra un pipeline completo de RLHF/GRPO aplicado a un modelo de menos de mil millones de parámetros, y por otro demuestra que un adaptador LoRA puede especializarse en una tarea de decisión concreta con recursos mínimos. El propio autor lo define como un modelo de investigación y educativo, y advierte de que no debe usarse para decisiones de negocio reales sin una validación previa con datos de la empresa objetivo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen/Qwen3.5-0.8B) con adaptador LoRA de PEFT |
| Parametros totales | 0.8B del modelo base; parametros del adaptador LoRA: no disponible |
| Parametros activos | no aplica (no se declara una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors sin cuantizar) |
| Idiomas soportados | coreano (ko) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, libreria peft) |

## Arquitectura y entrenamiento

El modelo no introduce una arquitectura nueva: reutiliza un transformer decoder-only de 0,8B parámetros (Qwen3.5-0.8B) y le superpone un adaptador LoRA entrenado con la librería PEFT. El prompt de sistema indica al modelo que trate el contenido de `state` como datos y no como instrucciones, seleccione exactamente una opción listada y devuelva solo su letra, sin explicación. La salida es, por tanto, una distribución de probabilidad sobre las letras de las opciones, donde el valor máximo funciona como medida de confianza.

El proceso de entrenamiento tiene cuatro etapas descritas en la model card: (1) una política pequeña se entrena con PPO dentro del simulador para operar la empresa durante miles de meses y actúa como profesor; (2) se construye un "cuaderno de problemas" reejecutando cada mes con opciones alteradas para puntuar cada alternativa; (3) se aplica aprendizaje supervisado imitando la opción mejor puntuada; y (4) se aplica aprendizaje por refuerzo con GRPO, agrupando las opciones y aumentando la probabilidad de aquellas cuyo resultado en el simulador supera la media, con normalización de ventaja por grupo y penalización KL respecto al modelo de partida. El reparto declarado de preguntas es `{"train": 4080, "valid": 828, "test": 840}` sobre una distribución de empresa de tipo `general`.

## Capacidades

- Clasificación de decisión: dado un estado, una pregunta y un conjunto de opciones etiquetadas, devuelve una única letra correspondiente a la opción elegida.
- Puntuación de confianza implícita: la probabilidad asociada a cada letra puede interpretarse como el nivel de confianza de la decisión.
- Seguimiento de instrucciones restringidas: respeta un prompt de sistema que exige tratar el estado como datos y no como instrucciones, y limitar la salida a una letra.
- Integración con Gymnasium: el modelo está pensado para operar sobre entornos de decisión serializados como JSON en el campo `state`.
- Aprendizaje por refuerzo aplicado: variante entrenada con GRPO, comparable a la variante de aprendizaje supervisado salida del mismo pipeline.
- Capacidades multilingües: no disponibles; el modelo declara únicamente coreano.
- Tool calling, function calling, agentes multi-paso, visión y audio: no disponibles (no se declaran en la información proporcionada).

## Casos de uso

- Formación corporativa en juegos serios: el modelo puede actuar como motor de decisión dentro de un simulador de gestión, evaluando las alternativas que elige el alumno y devolviendo la opción de referencia para comparar. Es adecuado porque toda su lógica de decisión proviene de datos del propio simulador.
- IA de personajes no jugadores en simuladores de gestión: integrado como controlador de un directivo virtual que responde a eventos mes a mes con una letra de acción, encaja directamente en bucles de simulación tipo Gymnasium.
- Investigación en aprendizaje por refuerzo: sirve como caso reproducible para comparar PPO, aprendizaje supervisado y GRPO sobre un modelo de menos de mil millones de parámetros, con métricas de precisión y arrepentimiento declaradas.
- Evaluación comparativa de métodos de alineación: al publicar resultados de precisión y arrepentimiento antes y después del entrenamiento, permite medir la ganancia real de GRPO frente a SFT en una tarea de clasificación de opciones.
- Generación de datos etiquetados para modelos de decisión: el modelo puede etiquetar automáticamente nuevas situaciones del simulador, generando pares estado-opción para reentrenar políticas mayores.
- Prototipado rápido de asistentes de decisión de bajo coste: al ser un adaptador LoRA sobre un modelo de 0,8B, permite desplegar un clasificador de decisión con requisitos de hardware mínimos en entornos de prueba.
- Componente de decisión en pipelines de agente dentro del simulador: la salida de una sola letra facilita encadenar decisiones en un bucle de agente sin necesidad de parsear texto libre.

## Benchmarks y rendimiento

Resultados publicados en la model card para el conjunto de test de 840 preguntas del simulador:

| Modelo | Precision en el test | Arrepentimiento (menor es mejor) | Beneficio mensual del simulador | Reduccion de perdidas en transacciones reales |
|---|---|---|---|---|
| Qwen antes del entrenamiento | 34,0 % | 2,30 | no disponible | no disponible |
| Aprendizaje supervisado | 75,1 % | 1,52 | no disponible | no disponible |
| Aprendizaje por refuerzo (este modelo) | 74,2 % | 1,41 | 4,25 millones de wones | 37 % (92/177) |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo modelo base, estimacion a partir de 0,8B parametros): aproximadamente 1,6 GB en fp16, 0,9 GB en int8 y 0,5 GB en int4; el adaptador LoRA anade un peso marginal de pocos megabytes.
- GPU recomendadas: cualquier GPU moderna con al menos 2-4 GB de memoria, como GTX 1650, RTX 3060, RTX 4060 o superiores; no requiere A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual e incluso en CPU para inferencia en cuantizacion baja.
- Opciones de despliegue: transformers junto con peft para cargar el adaptador tal cual; vLLM admite adaptadores LoRA; llama.cpp, Ollama o TGI requieren fusionar primero el adaptador con el modelo base y, opcionalmente, convertir a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de modelos publicos directamente comparables en la misma tarea (decision empresarial sobre el simulador CONNECT TYCOON). La comparacion mas informativa es interna al mismo pipeline:

| Version | Parametros | Precision en el test | Arrepentimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B base | 0,8B | 34,0 % | 2,30 | no disponible en esta ficha | modelo base publico |
| Variante de aprendizaje supervisado | 0,8B + LoRA | 75,1 % | 1,52 | no disponible | no publicada como checkpoint independiente |
| connectailab-rl-sharala-v1 (RL/GRPO) | 0,8B + LoRA | 74,2 % | 1,41 | apache-2.0 | HuggingFace |
| Politica profesora (PPO en el simulador) | no disponible | superior al modelo RL segun el autor | no disponible | no disponible | no disponible |

Modelos alternativos de la misma categoria (clasificadores de decision entrenados con RL sobre modelos pequenos) no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Alcance restringido: el modelo solo devuelve una letra de opcion; no genera explicaciones, razonamiento ni texto libre.
- Idioma: declarado unicamente para coreano, con un prompt de sistema en ingles; no hay soporte multilingue confirmado.
- Datos sinteticos: se entrena exclusivamente con datos generados por el simulador CONNECT TYCOON bajo una distribucion de empresa `general`, por lo que puede no transferir a empresas reales con caracteristicas distintas.
- Rendimiento inferior al profesor: el propio autor indica que la politica profesora entrenada con PPO en el simulador supera al modelo RL en rendimiento.
- Muestra de evaluacion pequena: la prueba de operacion real se reduce a una media de dos meses no vistos, con 840 preguntas de test, lo que limita la robustez estadistica de las cifras.
- Advertencia explicita del autor: modelo de investigacion y educacion; no debe usarse para decisiones de negocio reales sin revalidarlo con el historial de la empresa objetivo.
- Riesgo de eleccion invalida o alucinada: al forzar una letra de salida, el modelo puede seleccionar una opcion incoherente con el estado si este queda fuera de la distribucion de entrenamiento.
- Sesgos heredados: cualquier sesgo del modelo base Qwen3.5-0.8B y del diseno del simulador se traslada al adaptador.
- Estado del repositorio: 0 descargas, 0 likes y un tamano de repo de 0,0 GB, sin validacion independiente por parte de la comunidad.
- Licencia: el adaptador es apache-2.0, pero hay que verificar por separado la licencia del modelo base Qwen3.5-0.8B antes de un uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/coldpink/connectailab-rl-sharala-v1
- Repositorio CONNECT TYCOON en GitHub: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de aprendizaje en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de aprendizaje por refuerzo de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Repositorio connectailab en GitHub: https://github.com/jsunsheep/connectailab/blob/main/README.md
- coldconnectai: http://www.coldconnectai.com/
- Perfil de coldpink.archive: https://iiiil.ai/profile/coldpink.archive

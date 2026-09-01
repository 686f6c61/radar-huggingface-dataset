# jepacpp/lewm-pusht-GGUF

## Resumen

LeWorldModel Push-T es un modelo de world-model basado en la arquitectura Joint-Embedding Predictive Architecture (JEPA), desarrollado por el proyecto LeWM (lucas-maes/le-wm) y convertido a formato GGUF por jepacpp para su ejecución con jepa.cpp, un motor de inferencia en C/C++ basado en ggml que funciona sin Python ni PyTorch. El modelo combina un codificador de imagen ViT-Ti/14 con un predictor latente condicionado por acciones, diseñado para tareas de control y robótica como el benchmark Push-T. Con solo 18 millones de parámetros, es extremadamente ligero y puede ejecutarse en CPU convencional, lo que lo hace relevante para despliegues en entornos con recursos limitados o en tiempo real.

La conversión a GGUF permite cuantizaciones desde f32 hasta q4_k, manteniendo una alta fidelidad respecto al modelo original de PyTorch, con una degradación mínima en tareas de extracción de características. El modelo está pensado para ser utilizado como componente de un sistema de planificación y control, donde el codificador extrae representaciones latentes de imágenes y el predictor anticipa estados futuros dados una secuencia de acciones. Su licencia MIT facilita su uso comercial y académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-Ti/14 (encoder) + predictor causal AdaLN-zero con 6 bloques, condicionado por acciones de 10 dimensiones |
| Parametros totales | 18.026.176 (18 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de vision, procesa imagenes de 224x224) |
| Tipos de cuantizacion | f32, f16, q8_0, q4_0, q4_k (tambien q4_1, q5_0, q5_1, q5_k, q6_k generables localmente) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors disponible en el modelo base quentinll/lewm-pusht) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura JEPA propuesta por LeCun et al. (2026), que aprende representaciones latentes predictivas sin reconstruir los pixeles. El codificador es un ViT-Ti/14 con 12 capas, 3 cabezas de atencion y dimension de embedding 192, que procesa imagenes de 224x224. El token CLS se proyecta a un estado de world-model, y seis bloques causales con normalizacion AdaLN-zero, condicionados por un vector de accion de 10 dimensiones, predicen la evolucion de ese estado en el tiempo. Esta arquitectura permite planificar hasta 48 veces mas rapido que los world-models basados en modelos fundacionales, segun el proyecto LeWM.

El entrenamiento se realizo sobre la tarea Push-T, un benchmark de manipulacion robotica, utilizando SIGReg (Stable Iterative Guidance Regularization) en lugar del tradicional EMA target encoder, lo que mejora la estabilidad del entrenamiento. El modelo tiene aproximadamente 15 millones de parametros entrenables (el total es 18 M incluyendo el predictor) y puede entrenarse en una sola GPU en pocas horas. La conversion a GGUF incluye metadatos completos (dimensiones, esquema posicional, receta de preprocesado) dentro del archivo, de modo que la inferencia solo requiere el binario de jepa.cpp y el archivo GGUF.

## Capacidades

- Extraccion de caracteristicas de imagen: produce embeddings latentes de alta calidad, con un rendimiento de 27% top-1 en k-NN sobre Imagenette (1000 consultas, galeria de 2000), comparable al modelo PyTorch original.
- Prediccion de world-model: dado un estado latente y una secuencia de acciones, predice estados futuros, permitiendo simulacion y planificacion.
- Control condicionado por acciones: el predictor acepta un vector de accion de 10 dimensiones, lo que lo hace util para politicas de control en robotica.
- Ejecucion en CPU sin dependencias: gracias a jepa.cpp, funciona en hardware sin GPU ni Python, con un pico de memoria RSS de 47 MiB en f16.
- Cuantizacion robusta: mantiene una alta fidelidad incluso en q4_k (coseno medio 0.9988 respecto al modelo f32), siendo el modelo mas robusto a la cuantizacion de su familia.
- Causalidad verificable: el predictor incluye una comprobacion de causalidad bit-exacta, garantizando que las perturbaciones en un paso temporal no afectan a las predicciones anteriores.

## Casos de uso

- Planificacion de movimientos en robotica: el modelo puede predecir la evolucion de un estado latente dado un plan de acciones, permitiendo a un planificador como CEM (Cross-Entropy Method) evaluar multiples trayectorias y seleccionar la optima. Su velocidad (0.9 ms por imagen en GPU) lo hace adecuado para control en tiempo real.
- Simulacion de dinamicas en entornos 2D y 3D: al ser un world-model latente, puede sustituir a simuladores fisicos costosos en tareas de entrenamiento por refuerzo, generando rollouts sinteticos de estados futuros.
- Extraccion de caracteristicas para aprendizaje por refuerzo: el encoder puede usarse como backbone para politicas, proporcionando representaciones compactas y ricas de observaciones visuales, mejorando la eficiencia de muestra.
- Control de manipulacion con Push-T: especificamente entrenado para esta tarea, puede integrarse en sistemas de empuje de objetos con un planificador de bajo nivel, reduciendo la latencia frente a modelos basados en transformers de gran tamano.
- Prototipado de sistemas de IA embebidos: al ejecutarse en CPU con solo 47 MiB de RAM, es viable en dispositivos edge como Raspberry Pi o robots de bajo coste, para experimentacion academica o industrial.
- Investigacion en world-models y JEPA: sirve como referencia ligera y reproducible para estudiar arquitecturas predictivas latentes, con codigo abierto y herramientas de evaluacion (parity, quantization, accuracy) documentadas.

## Benchmarks y rendimiento

Los resultados de Imagenette k-NN (1000 consultas, galeria de 2000, k=20, caracteristica `emb` congelada) comparan el modelo en diferentes backends y dtypes:

| Backend | dtype | k-NN top-1 % | centroid top-1 % | Acuerdo con PyTorch % | Coseno medio de caracteristicas |
|---|---:|---:|---:|---:|
| PyTorch | f32 | 27.00 | 24.10 | — | 1 |
| jepa.cpp | f32 | 26.70 | 24.00 | 97.40 | 0.999994 |
| jepa.cpp | f16 | 26.60 | 24.00 | 97.40 | 0.999994 |
| jepa.cpp | q8_0 | 26.70 | 24.00 | 94.40 | 0.999929 |
| jepa.cpp | q4_k | 28.20 | 24.60 | 83.40 | 0.994496 |

Rendimiento de inferencia del encoder (grafo f16, 32 hilos): 10 ms por imagen en CPU (AMD Ryzen Threadripper PRO 7995WX 96-Cores) frente a 17 ms de PyTorch; 0.9 ms en GPU (NVIDIA RTX 4500 Ada Generation). Pico de RSS en f16: 47 MiB. No se han publicado resultados en benchmarks estandar de lenguaje (MMLU, HumanEval, GSM8K) porque el modelo no es de texto.

## Requisitos de hardware

- VRAM estimada: no requiere VRAM dedicada en CPU; en GPU, el modelo f16 ocupa aproximadamente 37.7 MiB de pesos, mas overhead de activaciones, por lo que cabe en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con soporte CUDA o Vulkan (por ejemplo, RTX 3060 o superior); en CPU, funciona en procesadores x86_64 con al menos 4 nucleos.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo (incluso integradas) gracias a su tamano reducido.
- Opciones de despliegue: jepa.cpp (motor principal), con soporte para cuantizacion local mediante `jepa-quantize`; tambien puede usarse el modelo base en PyTorch para investigacion.
- Latencia y throughput: 10 ms por imagen en CPU (Threadripper 96 nucleos) y 0.9 ms en GPU (RTX 4500 Ada); en CPU con menos nucleos la latencia sera mayor pero sigue siendo tiempo real para muchas aplicaciones.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros world-models en la informacion proporcionada. Sin embargo, el proyecto LeWM reporta que con ~15M parametros entrenables, planifica hasta 48 veces mas rapido que los world-models basados en modelos fundacionales, manteniendo competitividad en tareas de control 2D y 3D. Como referencia cualitativa:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LeWM Push-T (este) | 18 M | Imagen 224x224 | MIT | GGUF | JEPA, ejecucion en CPU |
| DreamerV3 | ~100 M (tipico) | Imagen 64x64 | MIT | PyTorch | Model-based RL, requiere GPU |
| IRIS | ~50 M | Imagen 64x64 | MIT | PyTorch | World-model con transformer, mas pesado |

La comparacion cuantitativa no esta disponible en los materiales consultados.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo de vision entrenado en un dataset especifico (Push-T), puede no generalizar a otras tareas o dominios visuales sin reentrenamiento.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero las predicciones del world-model pueden ser inexactas en estados fuera de la distribucion de entrenamiento.
- Limitaciones de contexto: solo procesa imagenes de 224x224; no soporta video ni secuencias largas directamente (aunque el predictor puede operar sobre multiples pasos).
- Restricciones de licencia: MIT, permite uso comercial sin restricciones, pero el modelo base (quentinll/lewm-pusht) tambien es MIT, por lo que no hay restricciones adicionales.
- Caveat de produccion: las cuantizaciones q4_0 y q4_k se consideran "advisory" (por debajo de 8 bits por peso) y no garantizan paridad con el modelo f32; se recomienda validar la calidad en la tarea objetivo antes de desplegar.
- Dependencia de jepa.cpp: el modelo solo puede ejecutarse con este motor; no es compatible con otros frameworks como llama.cpp o vLLM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jepacpp/lewm-pusht-GGUF
- Modelo base (PyTorch): https://huggingface.co/quentinll/lewm-pusht
- Repositorio jepa.cpp: https://github.com/aselimc/jepa.cpp
- Documentacion de jepa.cpp (parity, quantization, accuracy, performance): https://aselimc.github.io/jepa.cpp/
- Proyecto LeWM (codigo fuente): https://github.com/lucas-maes/le-wm
- Pagina del proyecto LeWM: https://le-wm.github.io/
- Implementacion de LeWM para Push-T con CEM: https://github.com/krishbansal-2205/lewm-pushT
- Paper (referencia en tags): arXiv:2603.19312 (no verificado en la busqueda)

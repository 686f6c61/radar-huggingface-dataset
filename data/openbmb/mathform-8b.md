# openbmb/MathForm-8B

## Resumen

MathForm-8B es un modelo de autoformalización matemática desarrollado por OpenBMB que traduce enunciados matemáticos en lenguaje natural a código Lean 4. Se publica junto al artículo *MathForm: Scaling Mathematical Autoformalization with Knowledge Retrieval and Verification-Guided Refinement* (arXiv:2608.14221). El modelo parte de Qwen/Qwen3-8B y se entrena mediante supervisión fina (SFT) seguida de aprendizaje por refuerzo con retroalimentación basada en compilación Lean y consistencia semántica.

El problema que resuelve es la verificación formal de matemáticas: convertir proposiciones informales en teoremas formales compilables en Lean 4, un paso crítico para la automatización de pruebas y la construcción de bibliotecas formales. Su relevancia actual radica en que combina un pipeline de datos a gran escala (dataset FormalVerse) con un mecanismo de verificación automática, lo que permite generar formalizaciones fiables sin intervención humana.

Con 8.190 millones de parámetros y una ventana de contexto de 16.384 tokens, MathForm-8B está pensado para integrarse en flujos de trabajo de demostración asistida y verificación formal. Su licencia Apache 2.0 facilita su uso comercial y académico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | no disponible (los ejemplos usan bfloat16) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MathForm-8B es un ajuste fino de Qwen3-8B, un transformer autoregresivo de 8.000 millones de parámetros. El entrenamiento se realiza en dos fases: primero una supervisión fina sobre el dataset FormalVerse, compuesto por pares de enunciados informales y formalizaciones Lean 4 verificadas; después, un aprendizaje por refuerzo que utiliza como señal de recompensa la compilación exitosa en Lean y la consistencia semántica entre la formalización generada y el enunciado original.

La innovación principal reside en el pipeline de construcción de datos: se emplea recuperación de conocimiento desde Mathlib (la biblioteca estándar de Lean) para enriquecer los ejemplos, seguida de verificación de compilación y de consistencia semántica, y un proceso de refinamiento iterativo que corrige formalizaciones defectuosas. Este enfoque permite escalar la generación de datos formales de alta calidad sin depender exclusivamente de anotaciones humanas.

## Capacidades

- Autoformalizacion de enunciados matematicos en Lean 4, incluyendo teoremas con cabecera y nombre de teorema especificado.
- Generacion de codigo Lean 4 compilable y semanticamente consistente con el texto informal.
- Razonamiento matematico formal de nivel avanzado, cubriendo areas como analisis real, algebra y teoria de numeros.
- Soporte de chat conversacional mediante plantilla de mensajes de Qwen3.
- Integracion con herramientas de verificacion formal: el modelo produce codigo que puede ser compilado y verificado por el servidor Lean (Kimina Lean Server).
- Capacidad de generar multiples candidatos de formalizacion (Pass@k) para aumentar la probabilidad de exito.

## Casos de uso

- Verificacion formal de teoremas en investigacion matematica: el modelo convierte conjeturas o proposiciones en lenguaje natural en teoremas Lean 4 que pueden comprobarse automaticamente, reduciendo el esfuerzo manual de formalizacion.
- Construccion de bibliotecas formales: permite traducir de forma masiva resultados informales a Lean 4 para ampliar Mathlib u otras bibliotecas, acelerando la cobertura de areas no formalizadas.
- Asistente en demostracion interactiva: integrado en editores como VS Code con Lean, sugiere formalizaciones candidatas que el usuario puede refinar o aceptar.
- Educacion matematica formal: genera ejercicios y soluciones formalizadas para ensenar demostracion asistida por ordenador, mostrando la estructura logica de las pruebas.
- Validacion de pruebas en publicaciones cientificas: los autores pueden formalizar sus resultados antes de publicar para garantizar su correccion logica, usando MathForm-8B como primer borrador.
- Automatizacion de pipelines de verificacion en ingenieria de software: aunque especializado en matematicas, puede usarse para formalizar especificaciones de propiedades matematicas en sistemas criticos, como protocolos o algoritmos, dentro de entornos Lean.

## Benchmarks y rendimiento

La model card reporta resultados de Pass@8 en seis benchmarks, evaluados bajo dos criterios: Syntax Check (SC) y Consistency Check (CC). Sin embargo, los valores numericos no se incluyen en el texto de la model card, solo en una figura del articulo. No se dispone de datos cuantitativos comparables en la informacion proporcionada.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 16 GB en bfloat16 (el repositorio ocupa 16,4 GB). Con cuantizacion de 8 bits podria reducirse a unos 8-10 GB, aunque no se especifican formatos de cuantizacion oficiales.
- GPU recomendadas: NVIDIA A100 (40 GB), H100, o GPUs consumer de 24 GB como RTX 4090 para ejecutar el modelo sin cuantizar. En tarjetas de 16 GB (RTX 4080, 3090) podria caber con cuantizacion, pero no esta documentado.
- Despliegue: compatible con Transformers (Hugging Face), vLLM, SGLang y servidores con API compatible con OpenAI. Tambien es compatible con text-generation-inference (TGI) segun los tags.
- Latencia y throughput: no disponibles. Se recomienda una ventana de generacion de hasta 16.384 tokens, lo que implica tiempos de inferencia considerables en hardware consumer.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de autoformalizacion matematica en la documentacion proporcionada. Se puede mencionar que existen alternativas como LeanDojo o modelos de proposito general con capacidad Lean, pero no se conocen sus especificaciones exactas en este contexto.

No disponible.

## Limitaciones y advertencias

- El modelo esta especializado en autoformalizacion matematica y su rendimiento fuera de ese dominio no esta garantizado; puede producir resultados incorrectos o sin sentido en otros temas.
- Riesgo de alucinacion: puede generar formalizaciones que compilan pero que no capturan correctamente el significado del enunciado original, especialmente en problemas ambiguos o complejos.
- Limitacion de idioma: solo soporta ingles; no se ha entrenado para otros idiomas.
- Ventana de contexto limitada a 16.384 tokens, lo que restringe la formalizacion de problemas muy largos o con multiples definiciones.
- Requiere un entorno Lean 4.21.0 y un servidor de compilacion (Kimina Lean Server) para verificar las salidas, lo que anade complejidad de infraestructura.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base (Qwen3-8B) tiene su propia licencia que debe respetarse; se recomienda revisar los terminos de Qwen.
- No se han publicado benchmarks numericos detallados en la model card, por lo que la comparacion objetiva con otros modelos es limitada.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/openbmb/MathForm-8B)
- [Articulo en arXiv](https://arxiv.org/abs/2608.14221)
- [Repositorio GitHub](https://github.com/OpenBMB/MathForm)
- [Dataset FormalVerse](https://huggingface.co/datasets/openbmb/FormalVerse)

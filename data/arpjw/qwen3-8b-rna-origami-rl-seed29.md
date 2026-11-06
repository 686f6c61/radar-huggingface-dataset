# arpjw/Qwen3-8B-RNA-Origami-RL-Seed29

## Resumen

Qwen3-8B-RNA-Origami-RL-Seed29 es un conjunto de adaptadores LoRA de rango 16 publicados por el usuario arpjw sobre el modelo base Qwen/Qwen3-8B. No se trata de un modelo conversacional generalista, sino de una política restringida para el diseño de estructuras secundarias de ARN cortas (inverse folding). El adaptador convierte un LLM preentrenado de 8.000 millones de parámetros en un generador de secuencias de nucleótidos que satisfacen un objetivo de estructura en notación dot-bracket, con un decodificador que impone la longitud y la compatibilidad de pares de bases solicitados.

El artefacto forma parte de un estudio sobre "origami molecular" y corresponde a la segunda semilla de aprendizaje por refuerzo (seed 29) del proyecto. Se entrenó mediante RL de grupo (group-relative) a partir de un checkpoint de ajuste supervisado (SFT) con semilla 17. El repositorio contiene únicamente los adaptadores y los ficheros del tokenizador (0,1 GB), no los pesos base, que deben descargarse por separado desde Qwen.

Es relevante ahora como ejemplo reproducible de aplicación de RL sobre LLMs a un dominio científico con restricciones duras de validez, y porque el autor publica resultados medidos, código fuente y limitaciones numéricas explícitas. No obstante, el propio autor advierte que no hay validación biológica experimental del plegado y que no se ha demostrado que un modelo de 8B sea necesario para la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) con adaptadores LoRA sobre las proyecciones q/k/v/o de atención |
| Parametros totales | 8.000 millones (modelo base) + 15.335.424 parámetros entrenables en el adaptador |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el estudio usa secuencias de 32, 48 y 64 nucleótidos) |
| Tipos de cuantizacion | no disponible; el estudio usa BF16 para los pesos base y FP32 para la proyección de salida de cuatro acciones |
| Idiomas soportados | no disponible; la tarea opera sobre tokens de nucleótidos con prefijo de espacio, no sobre lenguaje natural |
| Licencia | apache-2.0 (adaptadores); el modelo base y el tokenizador mantienen la licencia Apache 2.0 de Qwen |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); los pesos base no se incluyen |

## Arquitectura y entrenamiento

El modelo base es Qwen3-8B, un transformer decoder-only de 8.000 millones de parámetros en la revisión `b968826d9c46dd6066d109eabc6255188de91218`. Sobre él se aplican adaptadores LoRA de rango 16, alpha 32 y dropout cero, que modifican las proyecciones de atención q, k, v y o, sumando 15.335.424 parámetros entrenables. Los pesos base permanecen congelados en BF16 y la proyección de salida de cuatro acciones se mantiene en FP32.

El entrenamiento tiene dos fases. Primero un ajuste supervisado (SFT) con semilla 17 y checkpoint en el paso 800, y después un RL de grupo (group-relative) que parte de ese checkpoint SFT, con dos semillas (17 y 29) y checkpoint en el paso 300. La semilla 17 se designó como ejecución primaria antes de puntuar el conjunto de test. Los checkpoints se seleccionaron por recompensa de desarrollo y sus digests SHA-256 están registrados en `results/TRAINING_FROZEN.json`. La recompensa combina F1 de pares de bases, defecto de ensamblado normalizado y concordancia con la estructura de mínima energía libre devuelta por ViennaRNA. El conjunto de entrenamiento contiene 6.000 estructuras únicas con como máximo dos horquillas, en longitudes de 32, 48 y 64 nucleótidos.

La innovación técnica principal no está en la arquitectura, sino en el procedimiento de inferencia: el modelo debe usarse con `rna_origami.design` o `rna_origami.policy.Policy`, que aplican un prompt fijo, restringen las acciones a cuatro tokens de nucleótidos con prefijo de espacio y aplican un decodificador que fuerza la longitud y los pares de bases compatibles. Las probabilidades se normalizan sobre ese conjunto restringido de acciones. Cargar los adaptadores en una interfaz de chat convencional no reproduce el experimento.

## Capacidades

- Diseño de secuencias de ARN para una estructura secundaria objetivo en notación dot-bracket balanceada y sin pseudoknots.
- Generación de múltiples candidatos por objetivo (el estudio evalúa con ocho candidatos por diana) y selección del candidato por recompensa.
- Predicción del plegado de cada candidato y puntuación mediante F1 de pares de bases, defecto de ensamblado normalizado y concordancia con la MFE de ViennaRNA.
- Restricción dura de validez: el decodificador impone longitud y compatibilidad de pares de bases solicitados.
- No soporta tool calling, function calling, agentes multi-paso ni capacidades multimodales.
- No es un modelo multilingüe ni conversacional: opera sobre un vocabulario restringido de cuatro acciones.

## Casos de uso

- Diseño exploratorio de ARN corto en investigación computacional: dado un objetivo dot-bracket de 32 a 64 nucleótidos, generar ocho candidatos y quedarse con el de mayor recompensa, usando el pipeline `rna_origami.design` sobre una GPU con memoria suficiente.
- Reproducción de estudios de RL sobre LLMs: el paquete incluye adaptadores, datos sellados, hiperparámetros, código fuente y ledgers de candidatos, lo que permite reejecutar el experimento y comparar las semillas 17 y 29.
- Generación de baselines para comparar con métodos clásicos: los resultados del adaptador pueden contrastarse con RNAinverse (99,6 % en dianas familiares y 100 % en complejas con ocho reinicios) para calibrar la dificultad de la tarea.
- Docencia y divulgación sobre decodificación restringida: el ejemplo muestra cómo convertir un LLM generalista en una política válida mediante un decodificador que impone restricciones duras, sin reentrenar el modelo base.
- Evaluación de robustez de RL con múltiples semillas: al publicar dos semillas RL con el mismo SFT, permite estudiar la varianza entre ejecuciones (94,9 % frente a 96,5 % en dianas familiares).
- Investigación sobre exposición en preentrenamiento: el autor señala que no puede descartarse que Qwen3-8B haya visto material público de ARN, lo que convierte este artefacto en un caso de estudio sobre contaminación de datos en dominios científicos.

## Benchmarks y rendimiento

Resultados medidos con ocho candidatos por diana, inferencia en FP32:

| Conjunto de evaluacion | SFT (seed 17) | RL17 | RL29 | RNAinverse (8 reinicios) |
|---|---|---|---|---|
| 256 dianas familiares | 35,9 % | 94,9 % | 96,5 % | 99,6 % |
| 128 dianas complejas (longitud 64, >=3 horquillas) | 5,5 % | 85,9 % | 85,2 % | 100 % |

La comprobación con 30 dianas cortas de Eterna100-V2 es exploratoria y no constituye un resultado oficial de leaderboard. El autor advierte que todas las evaluaciones finales usan FP32 tras detectar una discrepancia excesiva entre probabilidades cacheadas y del profesor en BF16, y que las actualizaciones RL originales usaron cálculos BF16 en el modelo base, lo que pudo perturbar los ratios de importancia. La repetición propuesta con entrenamiento en FP32 no se ha realizado.

## Requisitos de hardware

- El estudio usó una única A100 de 80 GB, con pesos base en BF16 promovidos a FP32 y TF32 desactivado.
- Se requiere una GPU CUDA con memoria suficiente para inferencia a precisión completa; el comando de diseño no funciona en CPU.
- No se dispone de estimaciones de VRAM para cuantizaciones alternativas ni de datos de latencia o throughput.
- El repositorio ocupa 0,1 GB (solo adaptadores y tokenizador); los pesos base de Qwen3-8B deben descargarse aparte.
- Opciones de despliegue: el paquete `rna_origami` con `rna_origami.design` o `rna_origami.policy.Policy`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B-RNA-Origami-RL-Seed29 | 8B + 15,3M adaptador | no disponible | LoRA + RL para inverse folding de ARN | Apache 2.0 | Hugging Face (adaptadores) |
| Qwen/Qwen3-8B | 8B | no disponible en la informacion | LLM generalista | Apache 2.0 | Hugging Face |
| RNAinverse (ViennaRNA) | no aplica | no aplica | Búsqueda clásica de secuencias inversas | según terminos del proyecto | Software ViennaRNA |

No se dispone de datos de benchmarks de otros adaptadores de ARN comparables en la información proporcionada. La comparación con RNAinverse se limita a los porcentajes de dianas resueltas recogidos en la tabla de benchmarks.

## Limitaciones y advertencias

- No hay validación biológica experimental: el autor indica explícitamente que no se ha demostrado función biológica ni plegado en laboratorio.
- Solo admite objetivos dot-bracket balanceados y sin pseudoknots; no cubre estructuras con pseudoknots.
- Las longitudes de entrenamiento son 32, 48 y 64 nucleótidos; el test exploratorio de Eterna100-V2 incluye longitudes ausentes en entrenamiento.
- No puede descartarse exposición desconocida de Qwen3-8B a material público de ARN durante el preentrenamiento.
- Una semilla SFT y dos semillas RL no establecen robustez amplia, según el propio autor.
- La concordancia exacta con la MFE de ViennaRNA no implica un óptimo único de energía libre.
- La validez de salida la aportan las restricciones del decodificador, no el aprendizaje; la validez por sí sola no es un resultado aprendido.
- Limitación numérica: las evaluaciones finales usan FP32, pero las actualizaciones RL se hicieron con BF16 en el modelo base, lo que pudo alterar los ratios de importancia; la repetición en FP32 no se ha ejecutado.
- El paquete no incluye estado del optimizador para reanudar un entrenamiento interrumpido.
- Uso comercial: los adaptadores son Apache 2.0, pero el modelo base y el tokenizador conservan la licencia y aviso de Qwen; deben revisarse los términos de terceros del proyecto para software, puzzles y parámetros.
- Riesgo de alucinación en el sentido de generar secuencias válidas formalmente pero sin el comportamiento de plegado predicho; el propio autor no afirma que los diseños se plieguen como se predice.

## Enlaces

- Hugging Face: https://huggingface.co/arpjw/Qwen3-8B-RNA-Origami-RL-Seed29
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio del proyecto: https://github.com/arpjw/rna
- Guía de reproducibilidad: https://github.com/arpjw/rna/blob/main/docs/REPRODUCIBILITY.md
- Informe del estudio: https://github.com/arpjw/rna/blob/main/REPORT.md
- Términos de terceros: https://github.com/arpjw/rna/blob/main/THIRD_PARTY.md

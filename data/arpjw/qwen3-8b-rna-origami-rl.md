# arpjw/Qwen3-8B-RNA-Origami-RL

## Resumen

Qwen3-8B-RNA-Origami-RL es un conjunto de adaptadores LoRA de rango 16 publicados por el usuario arpjw sobre el modelo base Qwen/Qwen3-8B, orientados a una tarea muy concreta: el diseno de estructuras secundarias de ARN cortas mediante un decodificador restringido. No es un modelo conversacional ni un afinamiento generalista, sino un artefacto experimental de biologia computacional que transforma un LLM preentrenado en una politica restringida para "origami molecular" de ARN. El repositorio contiene unicamente los pesos de los adaptadores y los ficheros del tokenizador, no los pesos base.

El entrenamiento parte de un checkpoint supervisado (SFT con LoRA) y aplica despues aprendizaje por refuerzo con estimacion de ventaja relativa de grupo (group-relative RL) sobre dos semillas distintas (17 y 29). El adaptador modifica las proyecciones de atencion q/k/v/o, con alpha 32 y dropout cero, sumando 15.335.424 parametros entrenables. Los pesos base permanecen congelados en BF16 y la proyeccion de salida de cuatro acciones se ejecuta en FP32.

La relevancia del artefacto es metodologica y experimental: demuestra que un LLM de 8B con un decodificador que impone restricciones estructurales puede resolver una fraccion alta de objetivos de plegado secundario de ARN en su conjunto de evaluacion, aunque queda lejos de los metodos clasicos como RNAinverse. El autor es explicito en que no hay validacion biologica de laboratorio ni demostracion de funcion, y en que no se puede descartar exposicion previa a material publico de ARN durante el preentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) con adaptadores LoRA sobre atencion q/k/v/o |
| Parametros totales | 8B (base) + 15.335.424 parametros entrenables en los adaptadores |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-8B soporta contexto largo, pero la tarea usa secuencias de 32, 48 y 64 nucleotidos) |
| Tipos de cuantizacion | no disponible; inferencia de referencia en BF16 promovido a FP32, con TF32 desactivado |
| Idiomas soportados | no disponible (la tarea opera sobre tokens de nucleotidos con prefijo de espacio, no sobre lenguaje natural) |
| Licencia | Apache 2.0 (adaptadores y pesos base de Qwen) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); el repositorio no incluye los pesos base |

## Arquitectura y entrenamiento

El artefacto se apoya en Qwen/Qwen3-8B (revision `b968826d9c46dd6066d109eabc6255188de91218`), un transformer decoder-only de 8.000 millones de parametros. Sobre el se aplican adaptadores LoRA de rango 16 con alpha 32 y dropout cero que modifican exclusivamente las proyecciones de atencion q/k/v/o. Los pesos base se congelan en BF16 y la proyeccion de salida de cuatro acciones se mantiene en FP32. La tarea reformula el diseno de estructura secundaria como una politica sobre cuatro tokens de nucleotido existentes con prefijo de espacio, con un formato de prompt fijo y un decodificador que impone la longitud de secuencia y la compatibilidad de los pares de bases solicitados. Las probabilidades se normalizan sobre ese conjunto de acciones restringido.

El entrenamiento tiene dos fases. Primero un ajuste supervisado con LoRA (semilla 17, paso 800 seleccionado por recompensa de desarrollo). Despues, un RL con ventaja relativa de grupo partiendo de ese checkpoint SFT, con dos semillas (17 y 29), ambas con paso 300 seleccionado. El conjunto de entrenamiento contiene 6.000 estructuras unicas de hasta dos horquillas, con longitudes de 32, 48 y 64 nucleotidos. La recompensa combina F1 de pares de bases, defecto de ensemble normalizado y acuerdo con la estructura de minima energia libre devuelta por ViennaRNA. El autor advierte de una limitacion numerica: las actualizaciones de RL originales usaron computo base en BF16, lo que pudo perturbar los ratios de importancia; la repeticion propuesta con entrenamiento en FP32 no se ha realizado. El paquete incluye datos sellados, hiperparametros, codigo fuente y registros de candidatos, pero no el estado del optimizador para reanudar un entrenamiento interrumpido.

## Capacidades

- Diseno de estructuras secundarias de ARN cortas (32, 48 y 64 nucleotidos) a partir de un objetivo en notacion dot-bracket equilibrada y sin pseudonudos.
- Generacion de multiples candidatos por objetivo (la evaluacion usa ocho muestras por diana) y seleccion del candidato por recompensa.
- Decodificacion restringida que garantiza la validez estructural de la salida (longitud fija y pares de bases compatibles).
- Evaluacion de plegado predicho mediante ViennaRNA (defecto de ensemble normalizado y estructura MFE).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en el sentido de los LLM generalistas.
- No tiene capacidades multilingues, de vision ni de audio.
- No es un modelo de chat: cargarlo en una interfaz conversacional convencional no reproduce el experimento.

## Casos de uso

- Diseno de candidatos de ARN con estructura secundaria diana: dado un dot-bracket objetivo, el modelo genera varias secuencias candidatas y las puntua con la recompensa combinada; util para explorar el espacio de secuencias antes de una validacion in silico mas costosa.
- Generacion de conjuntos de partida para pipelines de plegado: los candidatos y sus plegados predichos se guardan en un JSON que puede alimentar herramientas posteriores (ViennaRNA, modelos de estructura terciaria) como cribado inicial.
- Estudio de metodos de RL aplicado a biologia: el paquete incluye datos sellados, hiperparametros y registros de candidatos, lo que permite reproducir y auditar el entrenamiento group-relative sobre una tarea con recompensa verificable.
- Benchmark de decodificadores restringidos: la comparacion entre SFT y RL con dos semillas sirve para medir el efecto del RL sobre una politica con acciones limitadas y validacion formal.
- Investigacion sobre sesgo de preentrenamiento en dominios cientificos: el autor senala que no se puede descartar exposicion a material publico de ARN, lo que convierte el artefacto en un caso de estudio sobre contaminacion de datos en tareas de biologia.
- Docencia y experimentacion en bioinformatica computacional: el codigo de `rna_origami.design` y `rna_origami.policy.Policy` permite ejecutar el flujo completo en una GPU A100 80 GB con fines formativos o de replicacion.

## Benchmarks y rendimiento

Resultados medidos por el autor con ocho candidatos por diana. Las metricas de "resueltos" corresponden a la fraccion de objetivos resueltos; las evaluaciones finales usan inferencia en FP32.

| Modelo / metodo | Diana familiar (256) | Diana compleja (128, long. 64, >=3 horquillas) |
|---|---:|---:|
| SFT LoRA (semilla 17, paso 800) | 35,9 % | 5,5 % |
| RL17 (semilla 17, paso 300) | 94,9 % | 85,9 % |
| RL29 (semilla 29, paso 300) | 96,5 % | 85,2 % |
| RNAinverse (8 reinicios + busquedas internas) | 99,6 % | 100 % |

Existe ademas una prueba exploratoria con 30 dianas cortas de Eterna100-V2, incluyendo longitudes ausentes del entrenamiento; el autor indica que no es un resultado oficial de leaderboard y no se proporcionan cifras en la informacion disponible.

## Requisitos de hardware

- Inferencia de referencia: una GPU A100 80 GB, con pesos base en BF16 promovidos a FP32 y TF32 desactivado.
- El comando `rna_origami.design` exige una GPU CUDA con memoria suficiente para inferencia a precision completa; el autor no especifica un minimo exacto.
- No se documenta soporte para cuantizacion ni despliegue en GPU de consumo; el flujo oficial asume precision completa.
- Opciones de despliegue: el paquete Python `rna_origami` (modulos `design` y `policy`), no vLLM, llama.cpp, Ollama ni TGI, ya que la tarea requiere un decodificador restringido y un formato de prompt fijo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo / metodo | Parametros | Contexto | Rendimiento (diana compleja) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B-RNA-Origami-RL (RL17) | 8B + 15,3M adaptador | secuencias de 32-64 nt | 85,9 % resueltos | Apache 2.0 | HuggingFace + GitHub |
| RNAinverse (ViennaRNA) | no aplica (algoritmico) | no aplica | 100 % resueltos | software libre (terminos de terceros del proyecto) | paquete ViennaRNA |
| Qwen/Qwen3-8B (base) | 8B | no disponible | no aplica a esta tarea sin adaptador | Apache 2.0 | HuggingFace |

La comparacion con otros LLM afinados para diseno de ARN no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No hay validacion biologica de laboratorio ni demostracion de funcion: el artefacto es un disenador computacional experimental.
- Un seed SFT y dos seeds RL no establecen robustez general; el propio autor lo advierte.
- No se puede descartar exposicion previa a material publico de ARN durante el preentrenamiento del modelo base, lo que afecta a la interpretacion de los resultados.
- La concordancia exacta con la estructura MFE de ViennaRNA no implica un optimo unico de energia libre; las restricciones de salida garantizan validez, pero la validez por si sola no es un resultado aprendido.
- Limitacion numerica: las actualizaciones de RL usaron BF16, lo que pudo perturbar los ratios de importancia; la repeticion en FP32 no se ha realizado.
- Solo admite objetivos dot-bracket equilibrados y sin pseudonudos; no cubre estructuras con pseudonudos ni longitudes fuera de las entrenadas de forma fiable.
- El paquete no incluye estado del optimizador, por lo que no se puede reanudar un entrenamiento interrumpido.
- Licencia Apache 2.0 para los adaptadores y para los pesos base de Qwen, con terminos de terceros separados para software, puzzles y parametros; conviene revisar `THIRD_PARTY.md` antes de uso comercial.
- No es un modelo de chat: usarlo en una interfaz conversacional convencional no reproduce el experimento.

## Enlaces

- HuggingFace: https://huggingface.co/arpjw/Qwen3-8B-RNA-Origami-RL
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio del proyecto: https://github.com/arpjw/rna
- Guia de reproducibilidad: https://github.com/arpjw/rna/blob/main/docs/REPRODUCIBILITY.md
- Informe del estudio: https://github.com/arpjw/rna/blob/main/REPORT.md
- Terminos de terceros: https://github.com/arpjw/rna/blob/main/THIRD_PARTY.md

# Natarizki/KFM-1.5B

## Resumen

KFM-1.5B (Kron Foundational Model) es un modelo de generacion de codigo especializado en lenguajes de programacion de sistemas, desarrollado por el usuario independiente Natarizki. Se trata de un fine-tuning del modelo base NX-AI/KronLSTM-1.5B-100B, que emplea una arquitectura KronLSTM con atencion lineal (Flash Linear Attention) en lugar del transformer clasico. El modelo cuenta con aproximadamente 1.500 millones de parametros, 24 capas y una ventana de contexto de 8.000 tokens.

El modelo resuelve un nicho concreto: la generacion de codigo en C, C++, ensamblador, Zig y Go, lenguajes habitualmente infrarrepresentados en los modelos generalistas de generacion de codigo. Frente a alternativas mas grandes y costosas, KFM-1.5B apuesta por un entrenamiento ligero y eficiente en memoria, realizado sobre dos GPU Tesla T4 de 16 GB, lo que lo hace reproducible en hardware de gama media.

Su relevancia actual reside en dos factores: por un lado, demuestra que es posible especializar un modelo pequeno en dominios tecnicos concretos con un presupuesto de computo minimo; por otro, la eleccion de una arquitectura LSTM con atencion lineal lo posiciona como una alternativa experimental interesante frente a los transformers tradicionales para tareas de generacion de codigo con requisitos de memoria moderados. La licencia Apache-2.0 facilita su adopcion tanto en investigacion como en entornos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | KronLSTM (24 capas) con Flash Linear Attention |
| Parametros totales | ~1.500 millones (1.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.000 tokens (8K) |
| Tipos de cuantizacion | no disponible (entrenado y publicado en bfloat16) |
| Idiomas soportados | Codigo: C, C++, Assembly, Zig, Go, Java, Kotlin, Python |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (bfloat16) |

## Arquitectura y entrenamiento

KFM-1.5B se construye sobre KronLSTM, una arquitectura recurrente de tipo LSTM con 24 capas que incorpora Flash Linear Attention, una variante de atencion lineal pensada para reducir el coste computacional y de memoria frente a la atencion cuadratica de los transformers. El modelo base, NX-AI/KronLSTM-1.5B-100B, fue preentrenado con 100.000 millones de tokens; KFM anade un fine-tuning especifico sobre codigo de sistemas.

El fine-tuning se realizo sobre 18.000 muestras extraidas de BigCode The Stack, organizadas en un curriculo combinado sin fases separadas: 15.000 muestras de lenguajes "duros" (C, C++, Assembly, Zig, Go, Java) y 3.000 de lenguajes "medios" (Kotlin, Python). La longitud de secuencia se limito a 512 tokens para ajustarse a la VRAM de las T4. Se empleo el optimizador Adafactor en bfloat16 sin escalado de gradientes (con aproximadamente un 90 % menos de estado del optimizador que AdamW), learning rate constante de 5e-5 sin warmup, weight decay de 0.01 y un batch efectivo de 4 mediante acumulacion de gradientes (4 pasos). El entrenamiento se ejecuto en 2 GPU NVIDIA Tesla T4 de 16 GB con DataParallel, gradient checkpointing y precision nativa BF16. No se aplico RLHF ni DPO.

## Capacidades

- Generacion de codigo en C, C++, Assembly, Zig, Go, Java, Kotlin y Python, con especial enfasis en los cinco primeros.
- Completado de funciones y estructuras tipicas de programacion de sistemas (punteros, manipulacion de memoria, estructuras de datos de bajo nivel).
- Generacion de codigo a partir de comentarios o firmas de funciones (prompt-based code completion).
- Razonamiento de sintaxis limitado al dominio de los lenguajes entrenados.
- Soporte multilingue exclusivamente a nivel de codigo; no se declara soporte de lenguaje natural.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- **Autocompletado en editores para lenguajes de sistemas**: el modelo puede integrarse como backend de completado en IDE para C, C++ o Zig, generando fragmentos a partir de firmas de funciones o comentarios. Su contexto de 8K tokens permite incluir el archivo en edicion y parte de las cabeceras relevantes.
- **Generacion de esqueletos de funciones de bajo nivel**: util para producir plantillas de funciones que manipulan punteros, listas enlazadas o buffers, un dominio bien cubierto por el subconjunto de The Stack empleado en el entrenamiento.
- **Asistencia en migraciones entre lenguajes de sistemas**: traduccion de fragmentos de C a Zig o Go, aprovechando que el modelo ha visto los tres lenguajes durante el fine-tuning, aunque con revision manual obligatoria.
- **Prototipado rapido de utilidades en C/C++**: generacion de funciones auxiliares (swap, reverse, busqueda en arrays) en entornos de desarrollo embebido donde no se dispone de acceso a modelos grandes en la nube.
- **Generacion de codigo ensamblador didactico**: produccion de fragmentos de Assembly para materiales docentes o ejemplos de bajo nivel, siempre con validacion posterior por un experto.
- **Investigacion sobre arquitecturas LSTM para codigo**: servir como punto de partida o baseline en estudios que comparen KronLSTM con transformers de tamano similar en tareas de generacion de codigo.
- **Entornos con recursos limitados**: al ser un modelo de 1.5B en bfloat16 (unos 3 GB de pesos), puede desplegarse en una unica GPU consumer para tareas de generacion de codigo offline o en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: aproximadamente 3 GB para los pesos en bfloat16 (tamano del repositorio: 3.0 GB); en torno a 4-6 GB considerando cache KV y overhead del runtime con contexto moderado.
- **GPU recomendadas**: cualquier GPU con al menos 8 GB de VRAM para bfloat16; Tesla T4 (16 GB) es el hardware de referencia del autor. Para contexto completo de 8K se recomienda 16 GB o mas.
- **Cabe en GPU consumer**: si, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070 (12 GB) o superiores.
- **Opciones de despliegue**: el modelo requiere la libreria `flash-linear-attention` (fla) y `trust_remote_code=True` en Transformers para registrar la arquitectura KronLSTM. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI; la carga se realiza mediante `AutoModelForCausalLM` mas `load_file` de safetensors.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Enfoque |
|---|---|---|---|---|---|
| KFM-1.5B | ~1.5B | 8K | KronLSTM + Flash Linear Attention | Apache-2.0 | Codigo de sistemas (C, C++, ASM, Zig, Go) |
| NX-AI/KronLSTM-1.5B-100B | ~1.5B | 8K | KronLSTM + Flash Linear Attention | Apache-2.0 | Base generalista de codigo |
| Modelos de codigo de ~1.5B de proposito general | ~1.5B | variable | Transformer | variable | Codigo generalista (no especializado en sistemas) |

La comparativa directa con modelos de codigo de tamano similar no esta disponible en la informacion proporcionada; los datos de rendimiento de KFM frente a alternativas no se han publicado.

## Limitaciones y advertencias

- **Ventana de contexto limitada**: 8K tokens, insuficiente para refactorizaciones de archivos completos o codebases grandes.
- **Cobertura de lenguajes restringida**: optimizado para lenguajes de sistemas; el rendimiento en lenguajes de alto nivel como JavaScript, TypeScript o Rust puede ser inferior al de modelos generalistas.
- **Escala de entrenamiento pequena**: solo 18.000 muestras de fine-tuning, lo que aumenta el riesgo de alucinacion de sintaxis en casos limite no cubiertos por el subconjunto de The Stack.
- **Sin alineacion de seguridad**: no se aplico RLHF ni DPO; el codigo generado debe revisarse siempre antes de ejecutarse.
- **Sin soporte documentado de tool calling ni agentes**: no apto para flujos agenticos sin trabajo adicional.
- **Dependencia de `flash-linear-attention`**: la carga requiere la libreria `fla` y `trust_remote_code=True`, lo que limita la portabilidad a runtimes estandar como llama.cpp u Ollama.
- **Licencia**: Apache-2.0 permite uso comercial, pero los datos de entrenamiento provienen de BigCode The Stack, con licencias variadas que conviene verificar para usos derivados.
- **Riesgo de sesgo**: no documentado por el autor; al entrenarse solo con codigo, no se han evaluado sesgos de otro tipo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Natarizki/KFM-1.5B
- Modelo base: https://huggingface.co/NX-AI/KronLSTM-1.5B-100B
- Dataset BigCode The Stack (referencia): https://huggingface.co/datasets/bigcode/the-stack
- Libreria flash-linear-attention: https://github.com/fla-org/flash-linear-attention

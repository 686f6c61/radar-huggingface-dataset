# LucasBRT/pionus-1.5b-v0.3

## Resumen

pionus-1.5b-v0.3 es un modelo de lenguaje de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones) especializado en la generación automática de mensajes de commit de Git siguiendo el estilo del repositorio donde se ejecuta. Lo desarrolla LucasBRT como parte de pionus, una herramienta de línea de comandos que redacta mensajes de commit localmente con un modelo pequeño. El modelo parte de Qwen/Qwen2.5-Coder-1.5B-Instruct y se afina mediante SFT primero y DPO después sobre muestras generadas por el propio modelo.

La relevancia del proyecto está en su enfoque de despliegue: un modelo de 1,5B cuantizado a Q4_K_M ocupa 986 MB y se ejecuta en CPU o en GPUs con Vulkan mediante llama.cpp, sin necesidad de infraestructura de servidor. Esto permite integrar la generación de mensajes de commit en el flujo de trabajo local del desarrollador, con privacidad total del código y sin coste por token.

La versión 0.3 es experimental y se centra en un paso de DPO sobre 5.500 commits no vistos durante el entrenamiento, con verificaciones automáticas que penalizan respuestas que copian asuntos recientes, inventan detalles ausentes en el diff, no dicen nada o usan scopes y tipos inválidos. Según la model card, este paso reduce drásticamente las respuestas no fundamentadas, aunque no mejora de forma significativa la predicción del tipo de commit.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajustado con LoRA SFT y DPO |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (safetensors), Q4_K_M (GGUF) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16), GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, heredado de Qwen2.5-Coder-1.5B-Instruct. Sobre esa base se aplicó primero un adaptador LoRA de SFT (el mismo que usó pionus-1.5b-v0.1) y después un segundo adaptador LoRA de DPO. Ambos adaptadores se incluyen en el directorio `training/` del repositorio, junto con `run.json` y el registro de la ejecución de DPO. Los pesos publicados son la fusión de ambos adaptadores en bf16.

El entrenamiento de DPO parte de 5.500 commits del split de train de CommitChronicle (revisión `5fd076e`), ninguno de ellos usado por v0.1 ni perteneciente a los repositorios de evaluación: 4.500 commits de 680 repositorios que siguen Conventional Commits (máximo 8 por repositorio) y 1.000 de repositorios jóvenes. Para cada commit se generaron seis muestras con el modelo v0.1 (temperatura 0,7, semillas fijas), y un conjunto de comprobaciones marcó como rechazadas las que copiaban un asunto reciente, nombraban un detalle ausente del diff, no decían nada, usaban un scope nunca visto en el repositorio o un tipo distinto al del commit real. Se añadieron además commits de estilo libre minados en una ejecución anterior, cuatro muestras cada uno. El resultado son 3.091 pares de entrenamiento (y 500 adicionales de otros repositorios, según el texto truncado de la model card). El prompt de entrenamiento es el de pionus byte a byte, con el conjunto completo de reglas (`--rules full`).

## Capacidades

- Generación de mensajes de commit de Git en formato Conventional Commits y en estilo libre, condicionada al diff, la lista de ficheros y el historial de asuntos del repositorio.
- Adaptación al estilo del repositorio: reutiliza scopes ya empleados y evita tipos que el repositorio no usa.
- Fundamentación en el diff: el paso de DPO reduce las palabras de la descripción que no aparecen en el diff, las rutas o el historial (0,130 de las palabras en respuestas Conventional frente a 0,145 en v0.1 y 0,327 en los commits reales).
- Generación con decodificación greedy en la evaluación, integrada en el binario de pionus con reintentos y fallback a la lista de ficheros.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo está especializado en una única tarea de generación.
- Capacidades multilingües: solo inglés.
- Capacidades especiales: no disponible (sin visión, audio ni modo thinking documentado).

## Casos de uso

- Generación local de mensajes de commit: el uso principal. El desarrollador ejecuta `pionus` en su repositorio y el modelo redacta el mensaje a partir del diff y del historial, sin enviar código a ningún servicio externo gracias a la ejecución local con llama.cpp.
- Integración en hooks de Git y scripts de pre-commit: al ocupar 986 MB en Q4_K_M y funcionar en CPU, puede invocarse desde un hook `prepare-commit-msg` para proponer un mensaje antes de que el usuario lo edite.
- Estandarización de Conventional Commits en equipos: el modelo aprende los tipos y scopes usados en el repositorio, lo que ayuda a mantener consistencia en proyectos que adoptan la convención pero donde los desarrolladores no la aplican de forma uniforme.
- Entornos con requisitos de privacidad: equipos que no pueden enviar diffs a APIs en la nube encuentran aquí una alternativa que corre en la máquina del desarrollador o en una GPU con Vulkan.
- Repositorios jóvenes con poco historial: la evaluación específica (`eval-short`, 197 commits de repositorios con 1 a 5 asuntos previos) mide el comportamiento en este escenario, donde el modelo alcanza un `type_match` de 0,702 con la lista de ficheros anotada.
- Investigación sobre DPO con datos auto-generados: el repositorio incluye los adaptadores, el registro de entrenamiento y el pipeline de verificación, lo que permite reproducir o adaptar la receta de DPO con comprobaciones automáticas a otras tareas de generación corta y condicionada.

## Benchmarks y rendimiento

Evaluación con eval-v1 (500 commits del split de test de CommitChronicle, repositorios nunca vistos en entrenamiento; 250 Conventional y 250 de estilo libre) y eval-short (197 commits de repositorios jóvenes). Decodificación greedy, Vulkan, pionus 0.9.0 más los commits de `main` hasta `236d51f`. Las columnas sin indicación corresponden a los 250 commits Conventional de eval-v1.

Con la lista de ficheros por defecto de pionus (anotada):

| Modelo | type_match | type_macro_f1 | scope_known | first_try | fallback | ungrounded | word_f1 | first_try (free) | word_f1 (free) | type_match (young) | fallback (young) | fallback (young, free) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Qwen2.5-Coder-1.5B-Instruct recuantizado (control) | 0,436 | 0,190 | 0,604 | 0,844 | 0,056 | 0,144 | 0,249 | 0,848 | 0,141 | 0,149 | 0,043 | 0,060 |
| pionus-1.5b-v0.1 | 0,676 | 0,581 | 0,852 | 0,928 | 0,028 | 0,076 | 0,362 | 0,888 | 0,256 | 0,681 | 0,085 | 0,047 |
| pionus-1.5b-v0.3 | 0,696 | 0,604 | 0,868 | 0,996 | 0,004 | 0,020 | 0,366 | 0,996 | 0,266 | 0,702 | 0,021 | 0,000 |

Con la lista de ficheros simple (la usada en entrenamiento):

| Modelo | type_match | type_macro_f1 | scope_known | first_try | fallback | ungrounded | word_f1 | first_try (free) | word_f1 (free) | type_match (young) | fallback (young) | fallback (young, free) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Qwen2.5-Coder-1.5B-Instruct recuantizado (control) | 0,428 | 0,184 | 0,576 | 0,836 | 0,060 | 0,160 | 0,238 | 0,868 | 0,138 | 0,170 | 0,064 | 0,053 |
| pionus-1.5b-v0.1 | 0,660 | 0,568 | 0,848 | 0,924 | 0,024 | 0,068 | 0,360 | 0,896 | 0,255 | 0,723 | 0,064 | 0,040 |
| pionus-1.5b-v0.3 | 0,692 | 0,589 | 0,864 | 0,996 | 0,004 | 0,020 | 0,366 | 0,996 | 0,265 | 0,681 | 0,021 | 0,000 |

Comparación pareada v0.3 frente a v0.1 sobre los 250 commits Conventional de eval-v1 con la lista anotada: `ungrounded` +0/−14 (p = 0,0), `first_copied` +0/−17 (p = 0,0), `first_try` +17/−0 (p = 0,0), `fallback` +0/−6 (p = 0,031); `type_match` +9/−4 (p = 0,267) y `scope_known` +6/−2 (p = 0,289), ninguno significativo.

Definiciones: `type_match` es la coincidencia del tipo Conventional con el commit real; `scope_known` indica que no hay scope o que el repositorio ya lo había usado; `first_try` mide si la primera respuesta fue utilizable; `fallback` indica que ninguna lo fue y pionus redactó el mensaje desde la lista de ficheros; `ungrounded` marca que ninguna palabra de contenido de la descripción aparece en el diff, las rutas o el historial; `word_f1` es el solapamiento de palabras con el asunto real. La fila de control es el modelo base cuantizado igual y ejecutado con el mismo prompt, por lo que no es comparable con números antiguos medidos con una versión anterior de pionus.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF Q4_K_M ocupa 986 MB en disco; los pesos en bf16 suman aproximadamente 3,1 GB (1.543.714.304 parámetros × 2 bytes). El repositorio completo ocupa 4,2 GB.
- GPU recomendadas: la model card solo valida CPU y GPUs con Vulkan a través de llama.cpp. No se documentan requisitos para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en cualquier GPU con soporte Vulkan con al menos aproximadamente 1,5 GB de memoria libre para la variante Q4_K_M; también funciona en CPU.
- Opciones de despliegue: llama.cpp (vía el binario de pionus, con `PIONUS_GGUF` apuntando al fichero GGUF) y safetensors para carga con librerías compatibles con Qwen2. La exportación a OpenVINO no está validada para este modelo. No se documenta soporte de vLLM, TGI ni Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pionus-1.5b-v0.3 | 1,54B | no disponible | Mensajes de commit de Git | apache-2.0 | HuggingFace (safetensors, GGUF) |
| pionus-1.5b-v0.1 | 1,54B | no disponible | Mensajes de commit de Git | apache-2.0 | HuggingFace |
| Qwen2.5-Coder-1.5B-Instruct | 1,54B | no disponible | Código general (modelo base) | apache-2.0 | HuggingFace |

La comparación cuantitativa entre estos tres modelos está en la tabla de benchmarks: frente al modelo base recuantizado, v0.3 eleva `type_match` de 0,436 a 0,696 y reduce `ungrounded` de 0,144 a 0,020 con la lista de ficheros anotada. No se dispone de datos de otros modelos especializados en mensajes de commit en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: la propia model card indica que la versión 0.3 sigue siendo experimental mientras cambia la receta de entrenamiento.
- La mejora en la predicción del tipo de commit no es significativa: `type_match` pasa de 0,676 a 0,696 frente a v0.1 con la lista anotada (p = 0,267), y el autor lo reconoce explícitamente.
- El modelo describe lo que dice el diff más que lo que significa el cambio; su `word_f1` con el asunto real es de 0,366, un solapamiento bajo.
- Solo inglés: el modelo no está entrenado ni evaluado en castellano ni en otros idiomas.
- Riesgo de alucinación mitigado pero no eliminado: un 2 % de respuestas quedan marcadas como `ungrounded` en la evaluación, y el sistema recurre a un fallback basado en la lista de ficheros en el 0,4 % de los casos.
- Dependencia del prompt de pionus: está entrenado byte a byte con ese prompt y el conjunto completo de reglas (`--rules full`); usarlo con otro formato de entrada puede degradar el comportamiento.
- Sesgos: no se documentan análisis de sesgos en la información disponible.
- Licencia apache-2.0, que permite uso comercial, pero el modelo hereda las características del base Qwen2.5-Coder-1.5B-Instruct; conviene revisar las condiciones de ese modelo para usos derivados.
- La exportación a OpenVINO no está validada, lo que limita el despliegue en hardware Intel con esa ruta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LucasBRT/pionus-1.5b-v0.3
- Versión anterior: https://huggingface.co/LucasBRT/pionus-1.5b-v0.1
- Repositorio de pionus: https://github.com/Lucas-BRT/pionus
- Documentación de evaluación de pionus: https://github.com/Lucas-BRT/pionus/blob/main/training/README.md
- Dataset CommitChronicle: https://huggingface.co/datasets/JetBrains-Research/commit-chronicle
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct

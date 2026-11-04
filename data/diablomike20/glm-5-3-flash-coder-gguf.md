# diablomike20/GLM-5.3-Flash-Coder-GGUF

## Resumen

GLM-5.3-Flash-Coder-RCO-152E es una versión podada y cuantizada del modelo MoE GLM-5.3-Flash (321B de Z.ai), redistribuida en formato GGUF por el usuario diablomike20. La poda reduce los expertos enrutados de 288 a 152 por capa, lo que rebaja el recuento de parámetros totales de 321B a aproximadamente 170B (confirmado por los 169.556.223.214 parámetros del safetensors original). El objetivo es permitir el uso del modelo en hardware doméstico combinando VRAM de GPU con RAM del sistema.

La selección de expertos se realizó mediante optimización (RCO) sobre una mezcla de sesiones agénticas, código en 21 lenguajes, matemáticas y texto general, seguida de una fase de "healing". Los autores reportan mejoras sustanciales frente a la versión anterior REAP144 en pruebas de bucle de razonamiento, aritmética y tareas de instrucciones.

La distribución incluye además un fine-tune anti-bucle (LoRA entrenado con GRPO y destilación del modelo completo) fusionado en los pesos de las cuantizaciones Q3_K_M, Q4_K_M y los dos ficheros de 2 bits, orientado a eliminar repeticiones en tareas de código multi-lenguaje. El modelo está pensado para codificación y uso agéntico en llama.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE transformer (GLM-5.3-Flash), 152 de 288 expertos por capa |
| Parámetros totales | 169.556.223.214 (~170B) |
| Parámetros activos | ~17B (según el autor, "321B-A18B becomes ~170B-A17B") |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0, Q4_K_M, Q3_K_M, IQ2_XXS, IQ2_XXS-downIQ2_S |
| Idiomas soportados | no disponible (entrenado según el autor con código en 21 lenguajes) |
| Licencia | MIT |
| Formato de pesos | GGUF (multiparte: hasta 4 ficheros en Q8_0) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer con arquitectura Mixture of Experts de 321B parámetros totales y 18B activos. Esta variante aplica poda de expertos por capa (de 288 a 152, incluyendo 8 "generalistas") mediante un proceso de optimización (RCO) cuya máscara de selección se calibró sobre sesiones agénticas, código en 21 lenguajes, matemáticas y un 15% de texto general, seguido de una fase de recuperación (healing) de los pesos podados.

Sobre esa base se aplicó un LoRA entrenado con RL de recompensa verificable (GRPO) con destilación del modelo completo, en tareas de código multi-lenguaje. El adaptador se fusionó en los pesos de Q3_K_M, Q4_K_M, IQ2_XXS e IQ2_XXS-downIQ2_S para eliminar los bucles de razonamiento observados en las cuantizaciones bajas. Los ficheros de 2 bits conservan atención, experto compartido y capas densas en tipos Q4_K/Q6_K/Q8_0, con solo los expertos enrutados en IQ2_XXS o IQ2_S (proyecciones down). No se detallan en la información disponible el número de tokens de entrenamiento del modelo base ni la composición exacta del dataset original.

## Capacidades

- Generación de texto y razonamiento general en modo conversacional.
- Codificación en 21 lenguajes (según la calibración del autor).
- Uso agéntico: sesiones multi-turno con tool calling / function calling (verificado en las pruebas del autor con llamadas a herramientas).
- Aritmética básica y ejecución de pequeñas tareas de código verificadas en las pruebas reportadas (17x23, 1234x5678, Fibonacci).
- Razonamiento multi-paso sin bucles de repetición tras el fine-tune anti-bucle (0 de 80 ejecuciones con bucle en tareas held-out de código).
- Capacidades multilingües: no disponible el detalle de idiomas naturales; el soporte está documentado a nivel de lenguajes de programación.
- Compatible con endpoints y con llama.cpp.

## Casos de uso

- Asistente de codificación local en estación de trabajo: con el fichero IQ2_XXS (47,4 GB) cabe en 24 GB de VRAM más 32 GB de RAM, permitiendo un copiloto de código privado sin conexión a servicios en la nube.
- Reparación de bucles en agentes de código: el fine-tune anti-bucle hace que el modelo sea adecuado como agente autónomo que itera sobre errores de compilación sin caer en repeticiones infinitas, escenario validado con la prueba Aider "hmm" (14 de 14 resueltos).
- Revisión y generación de código multi-lenguaje: útil en pipelines de CI/CD donde el modelo recibe fragmentos en distintos lenguajes y propone parches, gracias a la calibración sobre 21 lenguajes.
- Automatización de tareas aritméticas y de cálculo en scripts: las pruebas del autor verifican multiplicaciones grandes y secuencias tipo Fibonacci ejecutadas como código, lo que permite usarlo como generador de scripts verificables.
- Asistente conversacional técnico con tool calling: integrable en flujos donde el modelo necesita invocar funciones externas (APIs, consultas a bases de datos) en conversaciones multi-turno.
- Servicio de inferencia autoalojado con vLLM o llama.cpp: el formato GGUF y la licencia MIT permiten desplegarlo en infraestructura propia sin restricciones comerciales, en configuraciones multi-GPU (Q8_0 requiere 24 GB VRAM + 192 GB RAM).

## Benchmarks y rendimiento

| Prueba | Antes (REAP144 / pre-fine-tune) | Después (RCO-152E / post fine-tune) |
|---|---|---|
| Tareas de código held-out: ejecuciones con bucle (Q3_K_M) | 11 de 80 | 0 de 80 |
| Tareas de código held-out: resueltas (Q3_K_M) | 46 de 80 | 51 de 80 |
| Aider "hmm" test: ejercicios con bucle | 4 de 14 | 0 de 14 (14 de 14 resueltos) |
| Problemas en 30 ejecuciones duras de instruction-following | 22 (REAP144) | 4 (0 bucles de repetición) |

| Cuantización | Tamaño | KLD vs Q8 | Mismo token top que Q8 |
|---|---|---|---|
| Q8_0 | 180,4 GB | 0 | 100% (referencia) |
| Q4_K_M | 102,6 GB | 0,024 | 94,5% |
| Q3_K_M | 75,1 GB | 0,045 | 92,5% |
| IQ2_XXS-downIQ2_S | 50,8 GB | 0,115 | 88,3% |
| IQ2_XXS | 47,4 GB | 0,121 | 88,1% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Q8_0: 180,4 GB en 4 partes; requiere 24 GB VRAM + 192 GB RAM en configuración multi-GPU.
- Q4_K_M: 102,6 GB en 3 partes; válido con 24 GB VRAM + 96 GB RAM, 32 GB VRAM + 96 GB RAM o 128 GB de memoria unificada.
- Q3_K_M: 75,1 GB en 2 partes; cabe en 24 GB VRAM + 64 GB RAM o 32 GB VRAM + 64 GB RAM.
- IQ2_XXS: 47,4 GB en un único fichero; diseñado para 24 GB VRAM + 32 GB RAM.
- IQ2_XXS-downIQ2_S: 50,8 GB en 2 partes; misma configuración de 24 GB VRAM + 32 GB RAM, con menor KLD.
- No cabe en una GPU consumer única de 24 GB sin apoyo de RAM del sistema; el escenario objetivo es offload parcial a RAM.
- Despliegue: llama.cpp (formato GGUF nativo); compatible con endpoints según los tags del repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash-Coder-RCO-152E (este) | ~170B | ~17B | no disponible | MIT | GGUF | Poda de expertos + fine-tune anti-bucle |
| GLM-5.3-Flash (base) | 321B | 18B | no disponible | MIT | safetensors | Referencia completa; requiere mucho más hardware |
| REAP144 (versión anterior, retirada) | ~170B (144 expertos) | no disponible | no disponible | MIT | GGUF | Calibrada solo en Python agéntico; bucles en otros lenguajes |

No se dispone de datos comparativos de benchmarks frente a otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo podado: la eliminación de 136 expertos por capa puede degradar el rendimiento en dominios no cubiertos por la calibración (Python agéntico, 21 lenguajes de código, matemáticas y texto general al 15%).
- El fine-tune anti-bucle se validó sobre 40 tareas held-out y 14 ejercicios Aider; el riesgo de bucles en dominios fuera de esa distribución no está cuantificado.
- Los ficheros originales del 22 de octubre de 2026 estaban truncados (segunda mitad de tensores a cero) y producían salida basura; es imprescindible re-descargar y verificar los SHA256 publicados.
- La versión REAP144 anterior tenía errores aritméticos y bucles en preguntas generales; fue retirada, pero puede circular en cachés de terceros.
- Riesgo de alucinación inherente a modelos de lenguaje; no documentado en la información disponible.
- Longitud de contexto no disponible; conviene verificarlo antes de usarlo en conversaciones largas o repositorios extensos.
- Idiomas naturales soportados no documentados; el uso multilingüe conversacional no está verificado.
- Licencia MIT permite uso comercial sin restricciones, pero la procedencia de los datos del modelo base (zai-org/GLM-5.3-Flash) y sus términos originales deben revisarse por separado.

## Enlaces

- HuggingFace: https://huggingface.co/diablomike20/GLM-5.3-Flash-Coder-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Repositorio del recetario, máscara y harness de evaluación: https://github.com/lapadatbogdan/GLM-5.3-Flash-Coder-RCO-152E

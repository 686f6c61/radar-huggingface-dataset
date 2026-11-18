# mradermacher/Qwensploit-V2-2B-CyberSecurity-Qwen3.5-i1-GGUF

## Resumen

Qwensploit-V2-2B-CyberSecurity-Qwen3.5-i1-GGUF es una cuantizacion en formato GGUF, generada por mradermacher, del modelo xtools-at/Qwensploit-V2-2B-CyberSecurity-Qwen3.5. Se trata de un derivado de la familia Qwen (según la nomenclatura del nombre, basado en Qwen3.5) afinado para tareas de ciberseguridad, y empaquetado en multiples niveles de cuantizacion para su uso con llama.cpp y herramientas compatibles.

El repositorio es una publicacion de cuantizaciones (quants) con y sin imatrix, siguiendo el flujo habitual de mradermacher: se ofrecen variantes que van desde IQ1_S/IQ1_M (las mas agresivas) hasta Q6_K, pasando por Q4_K_M, Q5_K_M e IQ4_XS, entre otras. El objetivo es permitir la ejecucion local del modelo en hardware modesto, dado su tamano reducido dentro de la familia Qwen.

La informacion disponible sobre el modelo base es muy limitada: no se documentan en la model card ni la licencia, ni los idiomas, ni los datos de entrenamiento, ni resultados de benchmarks. El unico dato cuantitativo fiable en el repositorio es el recuento de parametros reportado por Hugging Face en safetensors (960.882), que no es coherente con un modelo de 2B, por lo que debe interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen3.5, segun el nombre del modelo) |
| Parametros totales | 2B (segun el nombre del modelo); el recuento reportado en safetensors es 960.882, dato no coherente |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, small-IQ4_NL |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base. Por la nomenclatura del nombre (Qwen3.5) cabe inferir que se trata de un transformer decoder-only de la familia Qwen, pero no se confirma en la informacion proporcionada. El modelo original fue publicado por xtools-at bajo el identificador Qwensploit-V2-2B-CyberSecurity-Qwen3.5, y esta version es una conversion a GGUF con cuantizaciones ponderadas (weighted) y con imatrix, generada por mradermacher.

No se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO o fine-tuning supervisado. El sufijo "CyberSecurity" sugiere un ajuste fino orientado a dominios de seguridad informatica, pero no hay informacion verificable sobre el corpus utilizado ni sobre el proceso de alineamiento. Tampoco se detallan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto: capacidades genericas heredadas del modelo base Qwen3.5, segun la nomenclatura.
- Especializacion en ciberseguridad: el nombre del modelo indica un ajuste orientado a tareas de seguridad, si bien no se documentan las capacidades concretas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Analisis de vulnerabilidades en local: al distribuirse en GGUF con cuantizaciones de 2 a 6 bits, el modelo puede ejecutarse en estaciones de trabajo sin GPU dedicada para asistir en la revision de codigo en busca de patrones inseguros, siempre que se valide su calidad real con pruebas propias.
- Asistencia en laboratorios de seguridad aislados: su formato GGUF y su tamano de 2B permiten desplegarlo en entornos air-gapped mediante llama.cpp, lo que resulta util para equipos que no pueden enviar datos a APIs externas.
- Generacion de explicaciones sobre conceptos de seguridad: puede emplearse como apoyo en formacion interna para redactar resumenes de tecnicas de ataque y defensa, con revision humana obligatoria por el riesgo de alucinacion.
- Prototipado rapido de asistentes especializados: gracias a las multiples cuantizaciones (desde IQ1_S hasta Q6_K) se puede ajustar el equilibrio entre calidad y recursos en funcion del hardware disponible.
- Clasificacion y etiquetado de textos tecnicos de seguridad: util como componente en pipelines de preprocesado para triar informes o alertas, aunque sin benchmarks publicados su rendimiento debe medirse empiricamente.
- Integracion en herramientas de desarrollo: mediante llama.cpp u Ollama puede incorporarse a editores o scripts de analisis estatico como capa de sugerencias, con validacion posterior de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 2B, las cuantizaciones Q4_K_M suelen ocupar del orden de 1,5-2 GB, e IQ1_S/IQ2 rondarian 0,5-1 GB, pero estos valores son estimaciones generales no confirmadas para este repositorio.
- GPU recomendadas: no disponible. Por tamano, cabria esperar que funcione en GPUs consumer con 4-8 GB de VRAM en cuantizaciones bajas, sin confirmacion oficial.
- Compatibilidad con GPU consumer: probable en tarjetas con al menos 4 GB de VRAM en cuantizaciones Q4 o inferiores, segun el tamano nominal de 2B; no verificado.
- Opciones de despliegue: llama.cpp y cualquier runtime compatible con GGUF (Ollama, LM Studio, llama-cpp-python). vLLM y TGI no soportan GGUF de forma nativa en todos los casos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwensploit-V2-2B-CyberSecurity-Qwen3.5-i1-GGUF | 2B (nominal) | no disponible | no disponible | GGUF | Cuantizacion de un fine-tune de seguridad; sin benchmarks publicados |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens (segun documentacion de Qwen) | Apache 2.0 (segun Qwen) | safetensors, GGUF | Modelo generalista oficial con licencia permisiva |
| Qwen2.5-3B-Instruct | 3B | 32.768 tokens (segun documentacion de Qwen) | Qwen Research License (segun Qwen) | safetensors, GGUF | Alternativa generalista de tamano similar |
| Phi-3-mini | 3,8B | 4.096 tokens (segun Microsoft) | MIT (segun Microsoft) | safetensors, GGUF | Modelo generalista con licencia permisiva |

Nota: los datos de los modelos comparativos provienen de su documentacion publica habitual; no se dispone de comparaciones directas de rendimiento con este modelo.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada sobre la calidad del modelo en tareas de ciberseguridad ni en tareas generales.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base (xtools-at/Qwensploit-V2-2B-CyberSecurity-Qwen3.5) antes de cualquier despliegue en produccion.
- Riesgo de alucinacion: al ser un modelo pequeno (2B) y sin datos de evaluacion, la probabilidad de respuestas incorrectas o inventadas es alta, especialmente en un dominio tecnico como la seguridad.
- Idiomas no documentados: se desconoce el soporte real de castellano u otras lenguas.
- Incoherencia en el recuento de parametros: el dato de safetensors (960.882) no concuerda con el nombre del modelo (2B), lo que sugiere que la metadata del repositorio puede ser erronea o incompleta.
- Repositorio sin descargas ni likes: no hay senales de validacion por parte de la comunidad.
- Uso dual: un modelo afinado en ciberseguridad puede generar contenido ofensivo si se emplea sin salvaguardas; se recomienda evaluacion de riesgos y filtros de salida.
- Cuantizaciones muy agresivas (IQ1_S, IQ1_M, IQ2_XXS): degradan notablemente la calidad; para uso serio se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwensploit-V2-2B-CyberSecurity-Qwen3.5-i1-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwensploit-V2-2B-CyberSecurity-Qwen3.5
- Perfil del autor de la cuantizacion: https://huggingface.co/mradermacher

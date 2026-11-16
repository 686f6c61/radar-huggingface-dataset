# mradermacher/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic-3-i1-GGUF

## Resumen

NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic-3-i1-GGUF es una cuantizacion en formato GGUF del modelo darkc0de/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic-3, publicada por el usuario mradermacher. Se trata de una variante "heretic" del modelo Nemotron 3.5 Bolt E4B de NVIDIA, un modelo de la familia Nemotron orientado a generacion de texto y razonamiento, del que se ha eliminado total o parcialmente el alineamiento de rechazo (el termino "heretic" se asocia habitualmente a procesos de ablacion de direcciones de rechazo). El nombre "E4B" sugiere una variante con aproximadamente 4.000 millones de parametros, aunque el dato de parametros reportado en safetensors (2.192.734) no es coherente con esa interpretacion y debe tratarse con cautela.

El repositorio contiene unicamente pesos cuantizados en GGUF con multiples niveles de cuantizacion (desde Q2_K e IQ1_S hasta Q6_K), generados a partir del modelo base en BF16 mediante cuantizacion ponderada con matriz de importancia (imatrix). El tamano del repositorio reportado es de 0.0 GB, lo que indica que la informacion de metadatos disponible es incompleta o que el repositorio no contiene los ficheros esperados en el momento de la consulta.

La relevancia de esta ficha es limitada: se trata de un artefacto derivado de un modelo base a su vez derivado, publicado con cero descargas y cero likes, sin model card sustantiva, sin licencia declarada y sin informacion de benchmarks. Cualquier uso en produccion deberia partir de la verificacion directa de los ficheros y de la licencia del modelo original de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia NVIDIA Nemotron; presumiblemente transformer, sin confirmar) |
| Parametros totales | 2.192.734 segun metadatos safetensors (dato no coherente con la nomenclatura E4B; no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small-IQ4_NL), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado); el modelo base de referencia se distribuye en BF16 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base. La nomenclatura remite a la familia NVIDIA Nemotron, y el sufijo "E4B" se asocia habitualmente a variantes de aproximadamente 4.000 millones de parametros, pero no se confirma en la informacion proporcionada. Tampoco se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron fases de RLHF, DPO o similar.

El proceso documentado en el repositorio es exclusivamente de cuantizacion: se han generado cuantizaciones ponderadas con imatrix (weighted/imatrix quants) a partir del modelo darkc0de/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic-3 en BF16, usando la herramienta de cuantizacion de llama.cpp (se infiere por el formato GGUF y la convencion de nombres de niveles). El sufijo "heretic" indica que el modelo de origen ha sido sometido a un proceso de ablacion de rechazo, practica que modifica el comportamiento del modelo ante solicitudes que el alineamiento original rechazaria. No se detalla la metodologia exacta de esa ablacion.

## Capacidades

- Generacion de texto y razonamiento general: capacidades heredadas del modelo base Nemotron, no verificadas en esta ficha.
- Generacion de codigo y matematicas: presumiblemente soportadas por el modelo base, sin datos que lo confirmen.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Comportamiento ante rechazo: modificado respecto al modelo original por el proceso "heretic"; se espera una menor tasa de rechazos ante solicitudes que el alineamiento original bloquearia.

## Casos de uso

- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutar el modelo en GPUs consumer con 8-16 GB de VRAM mediante llama.cpp u Ollama, lo que facilita pruebas locales sin infraestructura dedicada.
- Experimentacion con alineamiento y seguridad: la variante "heretic" resulta util para investigadores que estudian el efecto de la ablacion de rechazo sobre el comportamiento del modelo, comparando respuestas frente al modelo original.
- Prototipado de asistentes conversacionales: el formato GGUF y la disponibilidad de niveles de cuantizacion bajos (Q2_K, IQ2) permiten iterar rapidamente en entornos con recursos limitados.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece mas de veinte niveles de cuantizacion del mismo modelo, lo que permite medir la degradacion de calidad frente al tamano en un pipeline de evaluacion propio.
- Inferencia en CPU: las cuantizaciones Q4_0 y Q4_1, junto con llama.cpp, permiten ejecucion en CPU para tareas de generacion de texto por lotes donde la latencia no es critica.
- Fines educativos y de analisis: util para estudiar el pipeline de cuantizacion imatrix de llama.cpp y la conversion de pesos BF16 a GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision al no confirmarse el numero real de parametros. Como referencia orientativa, un modelo de ~4.000 millones de parametros en Q4_K_M ocupa aproximadamente 2,5-3 GB, en Q8 aproximadamente 4,5 GB y en BF16 unos 8 GB; estas cifras son estimaciones genericas y no estan verificadas para este modelo.
- GPU recomendadas: no disponible. Para un modelo de esa escala, una RTX 3060 de 12 GB o superior seria suficiente en cuantizaciones de 4 bits.
- Compatibilidad con GPU consumer: probable en cuantizaciones Q4 y Q5 si se confirma el tamano de ~4B; no verificable con los datos disponibles.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de informacion suficiente sobre el modelo base (parametros reales, contexto, rendimiento) para establecer una comparacion fiable con alternativas de la misma categoria. El dato de parametros reportado (2.192.734) es inconsistente con la nomenclatura E4B y no permite identificar modelos comparables.

## Limitaciones y advertencias

- El dato de parametros totales (2.192.734) procedente de safetensors no es coherente con la nomenclatura E4B ni con el tamano esperado del repositorio (0.0 GB); debe verificarse antes de cualquier uso.
- La licencia no esta declarada en el repositorio. El modelo base es de NVIDIA y su licencia original (probablemente NVIDIA Open Model License u otra) condiciona el uso comercial; es imprescindible consultarla antes de desplegar.
- El proceso "heretic" elimina o atenua los mecanismos de rechazo del modelo original, lo que incrementa el riesgo de generar contenido danino, sesgado o inapropiado. No es adecuado para aplicaciones de cara al publico sin filtros adicionales.
- Riesgo de alucinacion: no cuantificado; inherente a los modelos de lenguaje de esta escala.
- No hay informacion sobre sesgos conocidos, idiomas soportados ni limitaciones de contexto.
- El repositorio tiene cero descargas y cero likes, sin validacion de la comunidad; es un artefacto derivado sin garantias de calidad.
- La cuantizacion a niveles bajos (Q2_K, IQ1_S, IQ2) degrada notablemente la calidad de generacion; para produccion se recomienda Q4_K_M o superior.
- No se dispone de model card sustantiva ni de documentacion del proceso de cuantizacion mas alla de los metadatos tecnicos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic-3-i1-GGUF
- Modelo base de la cuantizacion: https://huggingface.co/darkc0de/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic-3
- Familia NVIDIA Nemotron en Hugging Face: https://huggingface.co/nvidia
- llama.cpp (runtime GGUF): https://github.com/ggml-org/llama.cpp

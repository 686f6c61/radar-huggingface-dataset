# mradermacher/Llama-Artemis-i1-GGUF

## Resumen
Llama-Artemis-i1-GGUF es la colección de cuantizaciones GGUF, generadas con imatrix, del modelo jgchaparro/Llama-Leonida, un ajuste fino de la familia Llama 3.1 orientado a la traducción al tsakonio, una variedad del griego en peligro de extinción. El trabajo de cuantización lo firma mradermacher, un autor habitual en el ecosistema GGUF, y pone a disposición del público versiones comprimidas desde 1 bit hasta 6 bits para su uso con llama.cpp y herramientas compatibles. El modelo base conserva la licencia Llama 3.1 y está etiquetado para el idioma griego (código `el`), con foco en lenguas minoritarias y de bajos recursos.

El interés de esta ficha reside en dos planos. Por un lado, el modelo original aplica técnicas de ajuste fino con GRPO y Unsloth sobre una base Llama, lo que lo convierte en un caso práctico de adaptación de un LLM generalista a una tarea lingüística muy específica con recursos escasos. Por otro, la colección de cuantizaciones de mradermacher permite ejecutar un modelo de 8.200 millones de parámetros en hardware de consumo, algo relevante para investigadores que trabajan con lenguas minoritarias sin acceso a clústeres de GPU.

La ficha describe tanto el modelo base como las versiones cuantizadas, con las especificaciones disponibles, las capacidades esperadas por su arquitectura y las limitaciones derivadas de su especialización y de la información publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1) |
| Parametros totales | 8.202.227.776 (8,2 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K; también hay cuantizaciones estáticas en el repo Llama-Artemis-GGUF |
| Idiomas soportados | Griego (`el`), con foco en tsakonio; el resto de idiomas de Llama 3.1 no está declarado explícitamente en la model card |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento
El modelo base, jgchaparro/Llama-Leonida, es un ajuste fino de un modelo de la familia Llama 3.1 de 8.200 millones de parámetros, con arquitectura transformer decoder-only estándar. La model card del repositorio cuantizado indica el uso de GRPO (Group Relative Policy Optimization) y de la librería Unsloth durante el ajuste, lo que sugiere un entrenamiento por refuerzo sobre una base preentrenada, orientado a mejorar la calidad de la traducción al tsakonio. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni los detalles del pipeline de RLHF o DPO.

La colección de mradermacher aplica cuantización con imatrix (matriz de importancia) sobre el modelo base, generando versiones i1 desde IQ1_S (2,2 GB) hasta Q6_K (6,8 GB). Se incluye además el fichero imatrix (0,1 GB) para que terceros puedan generar sus propias cuantizaciones. Las cuantizaciones estáticas están en un repositorio separado (Llama-Artemis-GGUF). No se documentan innovaciones arquitectónicas adicionales como decodificación especulativa o atención lineal.

## Capacidades
- Traducción automática entre griego y tsakonio, con foco declarado en lenguas en peligro de extinción y de bajos recursos.
- Generación de texto conversacional en griego, heredada de la base Llama 3.1.
- Razonamiento y comprensión lectora en griego, sujeto a la calidad del ajuste fino.
- Soporte de tool calling y function calling: no disponible en la información publicada; depende de la base Llama 3.1 y del ajuste, pero no se confirma.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: limitadas al griego según la etiqueta de idioma; el resto de idiomas de Llama 3.1 no se declara.
- Modo thinking, visión o audio: no disponible.

## Casos de uso
- Traducción de documentación y textos patrimoniales al tsakonio: el modelo puede emplearse para generar borradores de traducción de materiales culturales o lingüísticos, con revisión humana posterior dada la escasez de datos de referencia.
- Investigación en lingüística computacional de lenguas minoritarias: sirve como punto de partida para experimentos de adaptación de LLM a variedades del griego con pocos recursos, comparando el efecto de GRPO frente a ajuste supervisado.
- Creación de materiales didácticos para la enseñanza del tsakonio: generación de ejemplos, glosas y ejercicios a partir de un corpus limitado, con validación por hablantes nativos.
- Despliegue en hardware de consumo para trabajo de campo: las cuantizaciones Q4_K_M (5,1 GB) o Q5_K_M (6,0 GB) permiten ejecutar el modelo en portátiles con GPU de 8-12 GB, útil para investigadores que trabajan sin infraestructura de servidor.
- Prototipado de asistentes conversacionales en griego: la base Llama 3.1 aporta capacidad de diálogo multi-turno, aunque la calidad en griego estándar debe evaluarse empíricamente.
- Preservación digital de lenguas amenazadas: integración en pipelines de transcripción, traducción y documentación de corpus orales y escritos, con las cuantizaciones IQ3/IQ4 como compromiso entre tamaño y calidad.
- Evaluación comparativa de cuantizaciones: el fichero imatrix y el rango completo de cuantizaciones permiten estudiar la degradación de calidad en tareas de traducción de bajos recursos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia (según tamaño de cuantización): IQ1_S ~2,2 GB; IQ2_M ~3,1 GB; Q3_K_M ~4,2 GB; IQ4_XS ~4,7 GB; Q4_K_M ~5,1 GB; Q5_K_M ~6,0 GB; Q6_K ~6,8 GB. Añadir margen para contexto y caché KV.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q6; A100/H100 solo si se necesita contexto largo o batch grande.
- Cabe en GPU de consumo: sí, desde una GTX 1060 6 GB con IQ2/IQ3 hasta una RTX 4090 con Q6_K.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF; el repo declara `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles en la información publicada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama-Artemis-i1-GGUF (este) | 8,2 B | no disponible | llama3.1 | GGUF (i1) | Especializado en tsakonio/griego, cuantizaciones imatrix |
| jgchaparro/Llama-Leonida | 8,2 B | no disponible | llama3.1 | safetensors | Modelo base sin cuantizar del que deriva este |
| Llama-Artemis-GGUF (mradermacher) | 8,2 B | no disponible | llama3.1 | GGUF (estáticas) | Mismo modelo, cuantizaciones estáticas en lugar de imatrix |
| Llama 3.1 8B Instruct (Meta) | 8,0 B | 128 K (según model card oficial) | llama3.1 | safetensors, GGUF | Base generalista multilingüe; el contexto de Artemis no está confirmado |

## Limitaciones y advertencias
- Modelo especializado en tsakonio y griego: el rendimiento en otros idiomas no está garantizado ni documentado.
- Riesgo de alucinación elevado en una lengua de bajos recursos, con pocos datos de referencia para validar traducciones.
- Las cuantizaciones de 1 y 2 bits (IQ1_S, IQ1_M, IQ2_XXS) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "very low quality".
- Licencia Llama 3.1: restricciones de uso comercial y obligaciones de atribución según los términos de Meta; revisar antes de desplegar en producción.
- No se documentan sesgos específicos, pero al derivar de Llama 3.1 hereda los sesgos del preentrenamiento original.
- Longitud de contexto no confirmada en la información disponible; no asumir los 128 K de Llama 3.1 sin verificación.
- El repositorio pesa 96,4 GB por incluir todas las cuantizaciones; descargar solo los ficheros necesarios.
- Fecha de creación declarada en 2026-10-10, posterior a la fecha de esta ficha; verificar la vigencia de los enlaces.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/mradermacher/Llama-Artemis-i1-GGUF
- Modelo base: https://huggingface.co/jgchaparro/Llama-Leonida
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Llama-Artemis-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Llama-Artemis-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- README de referencia para GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/

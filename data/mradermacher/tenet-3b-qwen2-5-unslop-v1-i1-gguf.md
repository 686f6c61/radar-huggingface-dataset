# mradermacher/Tenet-3B-Qwen2.5-Unslop-v1-i1-GGUF

## Resumen
Tenet-3B-Qwen2.5-Unslop-v1-i1-GGUF es la versión cuantizada en formato GGUF del modelo Tenet-3B-Qwen2.5-Unslop-v1, desarrollado originalmente por mr-andrey-isachenko y cuantizado por mradermacher. Se trata de un modelo de lenguaje de aproximadamente 3.086 millones de parámetros (3,085.938.688 según los pesos en safetensors), construido sobre la base de Qwen2.5, lo que le aporta una arquitectura transformer densa ampliamente conocida y compatible con el ecosistema de herramientas existente.

El modelo se presenta como un derivado "abliterated" y "uncensored", es decir, con las capas de rechazo mitigadas, y está orientado a casos de uso agénticos, tool calling y generación de código. Incorpora etiquetas que indican entrenamiento con GRPO (Group Relative Policy Optimization) y un proceso denominado "unslop", que sugiere un ajuste fino para reducir respuestas redundantes o excesivamente verbosas. La licencia es Apache 2.0, lo que facilita su uso comercial.

La relevancia de esta ficha reside en que la versión i1-GGUF ofrece un abanico muy amplio de cuantizaciones con calibración imatrix, desde IQ1_S (0,9 GB) hasta Q6_K (2,6 GB), lo que permite desplegar el modelo en hardware de consumo muy modesto manteniendo un equilibrio razonable entre tamaño y calidad. El repositorio tiene 36,8 GB y acumula 1.887 descargas en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen2.5) |
| Parámetros totales | 3.085.938.688 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, más imatrix |
| Idiomas soportados | inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento
El modelo base es Tenet-3B-Qwen2.5-Unslop-v1, un transformer denso de 3B parámetros derivado de Qwen2.5. La model card del repositorio cuantizado no detalla la composición del dataset de entrenamiento ni el número exacto de tokens utilizados. Las etiquetas indican el uso de GRPO como método de optimización por refuerzo, así como un proceso de "abliteration" para eliminar mecanismos de rechazo y un ajuste "unslop" orientado a reducir la verbosidad y el estilo redundante en las respuestas. También se menciona fp8, vLLM y OpenRouter como parte del ecosistema de despliegue previsto.

La cuantización i1-GGUF utiliza calibración imatrix (importance matrix), lo que mejora la preservación de calidad en cuantizaciones agresivas respecto a las cuantizaciones estáticas equivalentes. El repositorio incluye además un archivo imatrix (0,1 GB) para que los usuarios puedan generar sus propias cuantizaciones. No se dispone de información sobre innovaciones arquitectónicas adicionales como decodificación especulativa o atención lineal.

## Capacidades
- Generación de texto conversacional en inglés.
- Razonamiento y respuesta a instrucciones, con un ajuste orientado a reducir respuestas redundantes ("unslop").
- Generación de código, según la etiqueta "coding".
- Soporte de tool calling y function calling, según la etiqueta "tool-use".
- Capacidades agénticas y razonamiento multi-paso, según la etiqueta "agentic".
- Modo sin censura ("uncensored") y con capas de rechazo mitigadas ("abliterated").
- Compatibilidad con endpoints y despliegue en vLLM y OpenRouter según las etiquetas del repositorio.
- Capacidades multilingües: no disponibles más allá del inglés declarado.

## Casos de uso
- Asistente conversacional autoalojado: el modelo puede desplegarse en local con llama.cpp u Ollama en formato GGUF, gestionando diálogos multi-turno en inglés con un consumo de VRAM muy reducido (desde ~1 GB en IQ1_S hasta ~2,6 GB en Q6_K), adecuado para prototipos y entornos con hardware limitado.
- Generación de código en pipelines de desarrollo: gracias a su etiqueta "coding" y su soporte de tool calling, puede integrarse en asistentes de IDE o scripts de automatización que requieran completar funciones, generar tests o sugerir parches, siempre con revisión humana dada su escala de 3B.
- Agentes automatizados con tool calling: su orientación "agentic" y "tool-use" permite construir flujos donde el modelo decide qué función invocar (APIs, consultas a bases de datos, operaciones de fichero) en tareas de automatización de soporte o back-office.
- Experimentación en investigación sobre alineación y censura: al ser un modelo "abliterated" y "uncensored", resulta útil para estudiar el comportamiento de modelos sin capas de rechazo, comparar respuestas frente a la versión base y analizar sesgos y riesgos en entornos controlados.
- Despliegue en dispositivos de borde: las cuantizaciones IQ2/IQ3 (1,0-1,6 GB) permiten ejecutar el modelo en mini-PC, Raspberry Pi de gama alta o portátiles sin GPU dedicada, para tareas de clasificación, resumen o generación de texto breve.
- Servicio de inferencia de bajo coste: con cuantizaciones Q4_K_M (2,0 GB) o Q5_K_M (2,3 GB) puede servirse mediante vLLM o llama.cpp en una única GPU de consumo, ofreciendo throughput elevado para cargas de trabajo ligeras y en inglés.
- Filtrado y reescritura de texto: el ajuste "unslop" está pensado para producir respuestas más concisas, lo que lo hace adecuado para tareas de reescritura, resumen o normalización de contenido donde la verbosidad es un problema.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 1,0-1,5 GB para IQ2/IQ3, 2,0-2,3 GB para Q4_K_M/Q5_K_M y 2,6 GB para Q6_K, sin contar el espacio para el contexto KV cache.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060) para cuantizaciones Q4/Q5; RTX 4090 o A100/H100 no son necesarias pero permiten mayor throughput y contextos más largos.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU dedicadas modernas e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (para pesos safetensors del modelo base), TGI y servidores compatibles con la API de OpenAI.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tenet-3B-Qwen2.5-Unslop-v1-i1-GGUF | 3,09B | no disponible | Apache 2.0 | GGUF | Abliterated, uncensored, orientado a agentes y código |
| Qwen2.5-3B-Instruct | ~3B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Modelo base oficial, alineado y seguro |
| Llama-3.2-3B-Instruct | ~3B | no disponible en esta ficha | Llama 3.2 Community License | safetensors, GGUF | Requiere aceptar licencia; no abliterated |
| Phi-3.5-mini-instruct | ~3,8B | no disponible en esta ficha | MIT | safetensors, GGUF | Ligeramente mayor, orientado a razonamiento |

La comparación cuantitativa de rendimiento no está disponible al no haberse publicado benchmarks para Tenet-3B. La principal diferencia frente a Qwen2.5-3B-Instruct y Llama-3.2-3B-Instruct es su naturaleza abliterated/uncensored y su ajuste específico para tool use y agentes, a costa de posibles riesgos de seguridad y de una menor validación comunitaria (0 likes en el repositorio).

## Limitaciones y advertencias
- Al ser un modelo "abliterated" y "uncensored", carece de las capas de rechazo habituales, por lo que puede generar contenido sensible, ofensivo o inseguro sin filtros; no es adecuado para aplicaciones de cara al público sin moderación adicional.
- Riesgo de alucinación inherente a un modelo de 3B parámetros; la precisión factual en dominios especializados es limitada y requiere verificación.
- Idioma: la model card declara únicamente inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto no documentada en la información disponible; conviene validarla empíricamente antes de usarla en producción con contextos largos.
- El proceso "unslop" y el ajuste GRPO no están documentados en detalle, lo que dificulta evaluar su impacto real en calidad y estabilidad.
- Aunque la licencia es Apache 2.0, el modelo base y los datos de entrenamiento pueden arrastrar obligaciones adicionales; conviene revisar la licencia del modelo base original.
- Escasa validación comunitaria: 0 likes y sin benchmarks publicados, lo que desaconseja su uso en producción crítica sin evaluación previa.
- El repositorio pesa 36,8 GB debido al gran número de cuantizaciones; descargar solo la variante necesaria.

## Enlaces
- Repositorio Hugging Face (GGUF i1): https://huggingface.co/mradermacher/Tenet-3B-Qwen2.5-Unslop-v1-i1-GGUF
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Tenet-3B-Qwen2.5-Unslop-v1-GGUF
- Modelo base: https://huggingface.co/mr-andrey-isachenko/Tenet-3B-Qwen2.5-Unslop-v1
- Página de overview del autor de las cuantizaciones: https://hf.tst.eu/model#Tenet-3B-Qwen2.5-Unslop-v1-i1-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png

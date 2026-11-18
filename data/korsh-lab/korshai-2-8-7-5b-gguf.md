# Korsh-Lab/KorshAI-2.8-7.5B-GGUF

## Resumen

KorshAI 2.8 es un modelo de lenguaje de generación de texto desarrollado por Korsh-Lab, publicado en Hugging Face bajo licencia Apache 2.0 y distribuido exclusivamente en formato GGUF (cuantización Q6_K) para su uso con llama.cpp, Ollama y otros motores de inferencia local. La model card lo presenta como un modelo de 7.5B de arquitectura, orientado a razonamiento técnico, generación de código y uso bilingüe inglés-español en hardware de consumo.

El dato de parámetros totales registrado en los safetensors del repositorio es de 4.326.350.848 parámetros (aproximadamente 4,3 mil millones), lo que difiere de la denominación comercial "7.5B" empleada por el autor en la model card. Esta discrepancia entre el nombre del modelo y el recuento real de parámetros es relevante para cualquier evaluación de requisitos de hardware y rendimiento.

El modelo se posiciona como una opción de "alta eficiencia" para producción local, con especial énfasis en el idioma español y en escenarios de generación de código y razonamiento. La información disponible sobre arquitectura interna, datos de entrenamiento y metodología de alineación es muy limitada: la model card se centra en tablas comparativas y guías de despliegue, sin detallar la composición del corpus ni el proceso de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica el tipo de transformer) |
| Parámetros totales | 4.326.350.848 (según safetensors); el autor lo denomina "7.5B" |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible de forma oficial; los ejemplos de despliegue usan `-c 4096` y la hoja de ruta menciona 8K/16K para una versión futura |
| Tipos de cuantización | Q6_K (GGUF); no se listan otras variantes en el repositorio |
| Idiomas soportados | inglés (en) y español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q6_K); no se publican safetensors en este repositorio, aunque el recuento de parámetros procede de safetensors |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo: no se especifica si se trata de un transformer denso, un modelo MoE, un híbrido SSM/attention ni la familia de la que deriva. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras formas de alineación por preferencias. La model card menciona un ajuste orientado a "instrucciones" y un alineamiento para reducir alucinaciones ("Zero Hallucination Alignment"), pero sin aportar metodología ni métricas que respalden esa afirmación.

Los únicos datos técnicos concretos que ofrece el autor son los relativos al empaquetado: cuantización Q6_K con un tamaño de archivo de aproximadamente 3,32 GB y un consumo de VRAM declarado de 3,7 GB. La hoja de ruta del proyecto anuncia para versiones futuras una actualización de precisión matemática, alineación estricta con esquemas JSON y una ventana de contexto extendida a 8K/16K, lo que sugiere que la versión actual no supera los 4K tokens de contexto de forma fiable.

## Capacidades

- Generación de texto conversacional con plantilla de chat basada en tokens especiales `<|im_start|>` y `<|im_end|>`.
- Razonamiento técnico y resolución de problemas, según la orientación declarada por el autor.
- Generación de código y asistencia en tareas de ingeniería de software.
- Capacidades bilingües nativas en inglés y español, con énfasis en terminología técnica (arquitectura de sistemas, diseño de API).
- Ajuste para instrucciones y adherencia a formatos, según la tabla de benchmarks del autor (IFBench 85,0%).
- Despliegue local en hardware de consumo mediante llama.cpp, Ollama, LM Studio, Jan y Text-Generation-WebUI.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Asistencia de código en local: el modelo puede integrarse en editores o pipelines mediante llama-server y generar fragmentos de código en inglés o español, con la ventaja de ejecutarse en GPUs de 8 GB y no requerir conexión a servicios externos.
- Generación de documentación técnica bilingüe: su enfoque declarado en inglés y español permite redactar y traducir documentación de API, guías de arquitectura y comentarios de código manteniendo terminología consistente.
- Chatbot de soporte para desarrolladores: con una ventana de contexto de 4K tokens, puede gestionar conversaciones multi-turno acotadas sobre errores de compilación, dudas de API o configuración de entornos.
- Prototipado rápido en estaciones de trabajo sin GPU dedicada: al poder ejecutarse en CPU (15-25 tok/s según el autor) o en Apple Silicon, sirve para validar flujos de generación de texto antes de escalar a modelos mayores.
- Automatización de tareas de refactorización acotadas: integrado en scripts de CI/CD mediante llama.cpp, puede aplicar transformaciones de código simples o generar parches sobre fragmentos delimitados.
- Educación y experimentación: adecuado para entornos docentes o de investigación que necesiten un modelo pequeño, con licencia permisiva y desplegable en hardware asequible, para estudiar comportamiento de modelos instruidos.
- Procesamiento de texto en español en entornos con requisitos de soberanía de datos: al ejecutarse íntegramente en local, permite tratar documentación sensible sin enviarla a la nube.

## Benchmarks y rendimiento

Los únicos datos disponibles proceden de la model card del autor. No se han verificado de forma independiente y las cifras de modelos comparados no coinciden con los valores publicados habitualmente para esos modelos, por lo que deben tomarse con cautela.

| Métrica / Benchmark | KorshAI 2.8 (7.5B) | Qwen 3.5 (9B) | Qwen 3.5 (4B) | gpt-oss (20B) | Qwen 3 (30B) | gpt-oss (120B) |
|---|---|---|---|---|---|---|
| Conocimiento (MMMLU / MMLU) | 90,9% | 81,2% | 76,1% | 69,7% | 78,4% | 78,2% |
| Razonamiento avanzado (GPQA / ARC) | 90,0% | 81,7% | 76,2% | 71,5% | 73,4% | 80,1% |
| Adherencia a instrucciones (IFBench) | 85,0% | 64,5% | 59,2% | 65,1% | 51,5% | 69,0% |
| VRAM (Q6_K / 4-bit) | 3,7 GB | ~7,8 GB | ~3,2 GB | ~16,2 GB | ~24,5 GB | ~80+ GB |
| Throughput en RTX 3070 8GB | 70,4 tok/s | ~38 tok/s | ~42 tok/s | OOM | OOM | Requiere clúster |

El autor indica que los resultados de KorshAI 2.8 están "verificados en local", pero no publica la metodología de evaluación, el número de muestras ni los scripts de reproducción. No hay resultados independientes disponibles.

## Requisitos de hardware

- VRAM estimada: 3,7 GB para la cuantización Q6_K según el autor; el archivo GGUF ocupa aproximadamente 3,32 GB.
- GPU recomendadas: RTX 3060, 3070 y 4060 (8 GB) con offload completo; RTX 4070, 4080 y 4090 (12 GB o más) para mayor throughput.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o más; también en Apple Silicon (M1-M4 con 8 GB o más) mediante aceleración Metal.
- Ejecución en CPU: posible con x86_64 con AVX2 y 16 GB de RAM, a 15-25 tok/s según el autor.
- Opciones de despliegue: llama.cpp / llama-server, Ollama (mediante Modelfile), LM Studio, Jan y Text-Generation-WebUI.
- Latencia y throughput estimados por el autor: 65-75 tok/s en RTX 3060/3070/4060; 90-130+ tok/s en RTX 4070/4080/4090; 50-70 tok/s en Apple Silicon; 15-25 tok/s en CPU. Estas cifras no han sido verificadas de forma independiente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| KorshAI 2.8 | 4,33B reales (denominado 7.5B) | no disponible (ejemplos a 4K) | Apache 2.0 | GGUF Q6_K | Hugging Face (Korsh-Lab) |
| Qwen 3.5 (4B) | ~4B | no disponible en la información | no disponible en la información | no disponible en la información | Referenciado en la model card del autor |
| Qwen 3.5 (9B) | ~9B | no disponible en la información | no disponible en la información | no disponible en la información | Referenciado en la model card del autor |
| gpt-oss (20B) | ~20B | no disponible en la información | no disponible en la información | no disponible en la información | Referenciado en la model card del autor |

La comparativa se limita a los modelos citados por el propio autor. No se dispone de datos independientes sobre contexto, licencia ni disponibilidad de esos modelos en la información proporcionada, por lo que la comparación cuantitativa debe considerarse no verificada.

## Limitaciones y advertencias

- Discrepancia entre el nombre comercial ("7.5B") y el recuento real de parámetros en safetensors (4,33B): conviene verificar el comportamiento real antes de asumir capacidades de un modelo de 7-8B.
- Los benchmarks de la model card no incluyen metodología, tamaño de muestra ni scripts de reproducción, y las cifras atribuidas a modelos competidores no coinciden con los valores publicados habitualmente; deben tratarse como no verificadas.
- No se documenta la arquitectura, el corpus de entrenamiento ni el proceso de alineación, lo que dificulta evaluar sesgos, contaminación de benchmarks y comportamiento en dominios específicos.
- La ventana de contexto efectiva no está confirmada; los ejemplos usan 4K tokens y la ampliación a 8K/16K se anuncia para una versión futura.
- La afirmación de "Zero Hallucination Alignment" no está respaldada por datos; como todo modelo generativo, existe riesgo de alucinación, especialmente en dominios no cubiertos por el entrenamiento.
- Soporte limitado a inglés y español; no se documentan capacidades multilingües adicionales.
- No se documenta soporte de tool calling, function calling ni uso como agente, lo que limita su integración en pipelines que requieran interacción con herramientas.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe asumir la responsabilidad de validar el modelo en su dominio y de cumplir con las obligaciones de atribución.

## Enlaces

- Hugging Face: https://huggingface.co/Korsh-Lab/KorshAI-2.8-7.5B-GGUF
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.

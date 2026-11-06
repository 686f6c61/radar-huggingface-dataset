# nileshc90/apex-phi-14b

## Resumen

ApexPhi-14B es un fine-tune del modelo Phi-4 de Microsoft Research (14.700 millones de parametros), publicado por Nilesh Chakraborty (usuario `nileshc90` en Hugging Face) bajo licencia MIT. El autor lo presenta como una "suite de doble edicion" orientada a estaciones de trabajo de desarrollador y Macs con Apple Silicon (M4 Max / M2 Max), con dos variantes: una especializada en codigo algoritmico de alta precision y otra en demostraciones matematicas formales y razonamiento paso a paso.

La propuesta principal del modelo es combinar la densidad algoritmica y matematica de Phi-4 con un perfil de memoria muy ajustado para hardware de consumo: segun la model card, ambas ediciones funcionan en torno a 10,4 GB de RAM con cuantizacion Q5_K_M y 8,9 GB con Q4_K_M, dejando mas de 23 GB libres en un equipo de 36 GB. Esto lo situa como una alternativa local para tareas de razonamiento tecnico sin depender de GPUs de datacenter.

El modelo se distribuye en formatos compatibles con transformers, Ollama y MLX, e incluye scripts para servir un endpoint compatible con la API de OpenAI en local. Aunque la model card menciona resultados de benchmarks (MATH-500 y GPQA Diamond), no se detalla la metodologia de evaluacion ni se aportan resultados de benchmarks propios del fine-tune, por lo que deben interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Microsoft Phi-4) |
| Parametros totales | 14,7 mil millones (14.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q5_K_M (~10,4 GB), Q4_K_M (~8,9 GB), Q8_0 para KV cache; pesos base en safetensors via transformers |
| Idiomas soportados | ingles (segun metadatos de Hugging Face y model card) |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers), GGUF (Ollama), MLX (Apple Silicon) |

## Arquitectura y entrenamiento

El modelo parte de Microsoft Phi-4, un transformer decoder-only de 14.700 millones de parametros entrenado por Microsoft Research sobre datos sinteticos de alta densidad tipo "textbook" y datos web filtrados, con un enfoque marcado en razonamiento matematico y cientifico. La model card de ApexPhi-14B no aporta detalles sobre el dataset de fine-tune, el numero de tokens adicionales, ni si se aplicaron tecnicas de RLHF, DPO o SFT supervisado; estos datos figuran como no disponibles.

La innovacion declarada por el autor es la separacion en dos ediciones con prompts de sistema y parametros de muestreo distintos: ApexPhi-Coder-14B usa temperatura 0,2, top_p 0,95 y min_p 0,04 para salidas deterministas y verificables, mientras que ApexPhi-Think-14B usa temperatura 0,6, top_p 0,95 y min_p 0,05 y encapsula el razonamiento intermedio en etiquetas `<think> ... </think>` antes de emitir la respuesta final. El autor menciona tambien un uso intensivo de min-p sampling para recortar tokens de cola con baja probabilidad y reducir alucinaciones, aunque no se documenta el proceso de entrenamiento que respalde estas afirmaciones.

## Capacidades

- Generacion de texto y razonamiento general en ingles.
- Codigo algoritmico de alta precision, con enfasis declarado en sintaxis verificada por AST y seguridad de tipos (edicion Coder).
- Razonamiento matematico y demostraciones formales, incluyendo induccion, paridad y estados limite (edicion Think).
- Modo de razonamiento explicito con etiquetas `<think>` para separar cadena de pensamiento y respuesta final.
- Razonamiento cientifico de nivel graduate (segun la model card, GPQA Diamond).
- Compatibilidad con endpoints de la API de OpenAI en local (via script MLX y Ollama).
- Integracion con Continue.dev y VS Code para autocompletado de tabulador.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponibles en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Asistente de codigo algoritmico en IDE: la edicion Coder, con temperatura baja y salidas deterministas, encaja como autocompletado y generacion de funciones en VS Code o Continue.dev, reduciendo variabilidad en sugerencias.
- Resolucion de problemas matematicos y demostraciones: la edicion Think, con razonamiento explicito en `<think>`, permite auditar los pasos intermedios en ejercicios de induccion, combinatoria o transiciones de maquina de estados.
- Razonamiento cientifico local sin GPU de datacenter: al caber en ~9-10 GB de RAM con Q4_K_M/Q5_K_M, se puede desplegar en un portatil Apple Silicon para consultas de nivel graduate sin enviar datos a la nube.
- Generacion de tests y verificacion de invariantes: el enfoque "zero-assumption invariant" declarado en la model card sugiere uso para generar aserciones y comprobaciones de limites en pipelines de CI/CD.
- Prototipado de endpoints compatibles con OpenAI: el script MLX levanta un servidor local en `127.0.0.1:8082/v1`, util para probar aplicaciones que consumen la API de OpenAI sin coste de inferencia externa.
- Educacion y tutoria tecnica: la separacion entre razonamiento y respuesta final facilita mostrar el proceso de resolucion a estudiantes en entornos offline.
- Analisis de codigo en entornos con requisitos de privacidad: al ejecutarse integramente en local con licencia MIT, es apto para equipos que no pueden enviar codigo a servicios externos.

## Benchmarks y rendimiento

La model card cita dos resultados, presumiblemente heredados de Phi-4 y no verificados de forma independiente para el fine-tune:

| Benchmark | Resultado citado |
|---|---|
| MATH-500 | 84,8 % |
| GPQA Diamond | 56,1 % |

No se han publicado resultados de benchmarks propios del fine-tune (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ni tablas comparativas con modelos similares. No se aportan datos de latencia o throughput.

## Requisitos de hardware

- VRAM/RAM estimada: ~10,4 GB con Q5_K_M y ~8,9 GB con Q4_K_M; ~0,6 GB adicionales para KV cache en Q8_0.
- Hardware objetivo declarado: Apple Silicon M4 Max / M2 Max con 36 GB de RAM unificada, con 0,00 MB de swap segun la model card.
- GPUs de datacenter: no se documentan requisitos ni pruebas en A100, H100 u otras GPUs NVIDIA.
- GPUs de consumo: no se documenta compatibilidad explicita con RTX 4090 u otras; el modelo esta orientado a memoria unificada de Apple Silicon.
- Opciones de despliegue: transformers, Ollama (`apex-phi-coder-14b`, `apex-phi-think-14b`), MLX (script `serve_mlx_phi4.sh`) y endpoint compatible con OpenAI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ApexPhi-14B (este modelo) | 14,7B | no disponible | MIT | Hugging Face, Ollama, MLX |
| Microsoft Phi-4 (base) | 14,7B | no disponible | MIT | Hugging Face, transformers |
| ApexCode-14B (mismo autor) | no disponible | no disponible | no disponible | Hugging Face |
| ApexThink-14B (mismo autor) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativos verificados entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- Los benchmarks citados (MATH-500, GPQA Diamond) no se acompanan de metodologia ni de evaluacion independiente del fine-tune; podrian corresponder al modelo base Phi-4.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la ficha, lo que implica ausencia de validacion comunitaria.
- La model card incluye afirmaciones de marketing no verificadas ("outperforms many 70B models", "zero non-Western georestrictions") que no estan respaldadas por datos en la informacion disponible.
- No se documenta el proceso de fine-tune, el dataset utilizado ni posibles sesgos introducidos.
- Riesgo de alucinacion inherente a modelos de 14B; el autor afirma mitigarlo con min-p sampling, pero no aporta evidencia.
- La licencia MIT permite uso comercial, pero al derivar de Phi-4 conviene verificar las condiciones de la licencia del modelo base.
- No hay datos sobre tool calling, agentes multi-paso ni context length, lo que limita su uso en pipelines agenticos complejos.
- Orientado a hardware Apple Silicon; el rendimiento en GPUs NVIDIA no esta documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nileshc90/apex-phi-14b
- Modelo base Phi-4: https://huggingface.co/microsoft/phi-4
- Repositorio GitHub: https://github.com/nileshchakraborty/apex-phi-14b
- ApexCode-14B: https://huggingface.co/nileshc90/apex-code-14b-instruct
- ApexThink-14B: https://huggingface.co/nileshc90/apex-think-14b
- ApexMistral-22B: https://huggingface.co/nileshc90/apex-mistral-22b

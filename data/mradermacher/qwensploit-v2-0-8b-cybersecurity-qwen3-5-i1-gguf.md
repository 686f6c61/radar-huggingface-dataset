# mradermacher/Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5-i1-GGUF

## Resumen

Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5-i1-GGUF es una cuantizacion en formato GGUF del modelo Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5, un ajuste fino (fine-tuning) de la familia Qwen3.5 especializado en ciberseguridad, red team, pruebas de penetracion y resolucion de CTF. El modelo original fue desarrollado por el usuario xtools-at y esta cuantizado por mradermacher, un perfil conocido por publicar versiones GGUF optimizadas (con imatrix) de modelos open source para su uso en llama.cpp y entornos de inferencia local.

Se trata de un modelo pequeno: 772.845.888 parametros totales (aproximadamente 0,8 mil millones), lo que lo situa en la categoria de modelos ligeros ejecutables en hardware de consumo. Su entrenamiento combina varios datasets de instrucciones y razonamiento en ciberseguridad, incluyendo datos de pentesting ofensivo, ShareGPT de seguridad y trazas de razonamiento de alta calidad. El resultado es un modelo orientado a tareas de analisis de seguridad, generacion de comandos, explicacion de vulnerabilidades y asistencia en entornos controlados de investigacion.

La relevancia actual radica en la demanda creciente de asistentes especializados en seguridad que puedan ejecutarse localmente, sin depender de APIs externas, para tareas sensibles como auditorias, analisis de configuraciones o formacion en entornos aislados. Al ser un modelo de 0,8B, su principal atractivo es el bajo coste computacional y la posibilidad de desplegarlo en portatiles o equipos sin GPU dedicada, a costa de una capacidad de razonamiento limitada en comparacion con modelos de mayor tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), ajuste fino con LoRA/PEFT sobre modelo base |
| Parametros totales | 772.845.888 (~0,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-Q4_0, i1-IQ4_XS, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (cuantizaciones con imatrix); existen tambien cuantizaciones estaticas en el repositorio hermano |
| Idiomas soportados | en (ingles) |
| Licencia | other (no especificada en detalle; requiere consultar el modelo base) |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5, un transformer decoder-only de la familia Qwen. El ajuste fino se realizo mediante LoRA/PEFT sobre el modelo base xtools-at/Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5, que a su vez parte de un modelo Qwen3.5 de 0,8B. La model card indica el uso de la libreria Unsloth para el entrenamiento, lo que sugiere un proceso optimizado para bajo consumo de memoria. No se especifican el numero de tokens de entrenamiento ni la composicion exacta del dataset, aunque se listan siete datasets de ciberseguridad: PentesterFlow/OffsecCyber, ChaoticNeutrals/Cybersecurity-ShareGPT, Voidreaper2026/cybersec-master-dataset, Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset, saidutta69/CyberSec-Reasoning-Premium, saidutta69/qwen3.8-max-distillation-50k-clean y xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x.

Entre las innovaciones tecnicas destacadas en los tags figuran "mtp" (multi-token prediction, probablemente), "reasoning" e "instruction-tuning". La model card menciona que es un modelo de vision ("This is a vision model"), aunque no se proporcionan detalles sobre el componente de vision ni sobre los archivos mmproj, que estarian en el repositorio estatico. No se documentan tecnicas como decodificacion especulativa o attention linear. La cuantizacion se realizo con imatrix (matriz de importancia) para preservar la calidad en las versiones de baja precision.

## Capacidades

- Generacion de texto y razonamiento especializado en ciberseguridad: analisis de vulnerabilidades, explicacion de tecnicas de ataque y defensa, y resolucion de retos CTF.
- Asistencia en red team y pruebas de penetracion: generacion de comandos, payloads y procedimientos en entornos controlados.
- Razonamiento multi-paso (segun el tag "reasoning" y el dataset de trazas de razonamiento de Claude Haiku).
- Instruccion-tuning: sigue instrucciones conversacionales y mantiene dialogos multi-turno.
- Capacidades de vision: la model card indica que es un modelo de vision, aunque no se detalla el alcance ni los archivos mmproj asociados.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles (en).
- Capacidad especial: modo de razonamiento (thinking) inferido por el tag "reasoning", aunque no se documenta explicitamente.

## Casos de uso

- Formacion en ciberseguridad: el modelo puede generar explicaciones de vulnerabilidades y escenarios de ataque en entornos de laboratorio, gracias a su entrenamiento con datasets de pentesting y CTF. Su tamano reducido permite ejecutarlo en portatiles para sesiones de aprendizaje sin conexion.
- Asistencia en retos CTF: puede ayudar a interpretar pistas, sugerir tecnicas de explotacion y explicar conceptos de seguridad, aunque su capacidad de razonamiento esta limitada por los 0,8B de parametros.
- Analisis de configuraciones de seguridad: dado un fragmento de configuracion (por ejemplo, reglas de firewall o permisos), el modelo puede senalar posibles debilidades y sugerir mejoras, siempre con supervision humana.
- Generacion de comandos de reconocimiento: en un entorno aislado, puede proponer comandos de enumeracion (nmap, gobuster, etc.) y explicar su funcion, util para automatizar tareas repetitivas en laboratorios.
- Redaccion de informes de auditoria: puede estructurar hallazgos, describir riesgos y proponer remediaciones a partir de notas tecnicas, aprovechando su entrenamiento en instrucciones de seguridad.
- Chatbot de soporte para equipos de seguridad: integrado en un asistente interno, puede responder preguntas frecuentes sobre procedimientos, herramientas y buenas practicas, con la ventaja de ejecutarse localmente y no enviar datos sensibles a terceros.
- Preprocesamiento de datos de seguridad: puede clasificar y resumir textos tecnicos (por ejemplo, avisos de vulnerabilidad) para alimentar pipelines de analisis, gracias a su bajo coste de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,5 GB (i1-Q2_K) y 0,7 GB (i1-Q6_K) para los pesos cuantizados, mas el overhead del contexto y del runtime (tipicamente 0,5-1 GB adicionales).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, GTX 1050 Ti, RTX 3050). Tambien puede ejecutarse en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna e incluso en iGPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (segun tags), transformers con soporte GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada, aunque por el tamano se espera una latencia muy baja (decenas de tokens por segundo en CPU moderna y cientos en GPU).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5-i1-GGUF | ~0,8B | no disponible | other | GGUF en HF | Especializado en ciberseguridad, solo ingles |
| Qwen3.5-0.8B (base) | ~0,8B | no disponible | no disponible | HF | Modelo generalista, sin especializacion en seguridad |
| Modelos de seguridad de mayor tamano (p. ej., 7B-13B) | 7B-13B | variable | variable | HF | Mayor capacidad de razonamiento, pero requieren mas VRAM |

No se dispone de datos de benchmarks para establecer una comparacion cuantitativa con alternativas. La comparativa se limita a parametros y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con datasets de ciberseguridad, puede reproducir sesgos presentes en dichos datos (por ejemplo, enfoques ofensivos sin matices eticos). No se documentan evaluaciones de sesgo.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar comandos o explicaciones plausibles pero incorrectas, especialmente en un dominio tecnico donde los errores pueden tener consecuencias graves. Se recomienda validacion humana.
- Limitaciones de contexto o idioma: solo soporta ingles; la longitud de contexto no esta documentada. Su tamano de 0,8B limita el razonamiento complejo y la retencion de contexto largo.
- Restricciones de licencia: la licencia es "other", no especificada. Es imprescindible consultar la licencia del modelo base (xtools-at/Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5) antes de cualquier uso comercial.
- Caveats para produccion: el modelo esta orientado a investigacion y entornos controlados. Su uso en produccion para tareas de seguridad ofensiva sin supervision puede violar legislaciones. Ademas, al ser una cuantizacion, puede perder calidad respecto al modelo original en safetensors.
- La model card indica que es un modelo de vision, pero no se proporcionan los archivos mmproj en este repositorio (estarian en el estatico), lo que puede limitar su uso multimodal tal cual.

## Enlaces

- Repositorio Hugging Face (cuantizaciones con imatrix): https://huggingface.co/mradermacher/Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5
- Pagina de overview del cuantizador: https://hf.tst.eu/model#Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5-i1-GGUF
- FAQ y solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (ejemplo de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de comparacion de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

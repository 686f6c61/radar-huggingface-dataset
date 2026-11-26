# shemking/agrillm-qwen2.5-1.5b-agri

## Resumen

AgriLLM es un ajuste fino completo de Qwen2.5-1.5B-Instruct orientado a asistencia agronómica para pequeños agricultores y agentes de extensión agraria en África subsahariana. Lo desarrolla el autor independiente shemking en el contexto de ADTC 2026, y su propuesta central es la operación totalmente offline: el modelo se distribuye cuantizado en GGUF Q4_K_M (940 MB) y funciona solo con CPU en aproximadamente 1 GB de memoria, sin GPU ni conexión de red tras la descarga. Con 1.543.714.304 parámetros, cubre el hueco de herramientas de IA accesibles en entornos donde la conectividad es intermitente y el coste de la inferencia en la nube es prohibitivo.

El corpus de entrenamiento es específico y deliberadamente acotado: 6.703 filas que cubren plagas y cultivos relevantes para la región (gusano cogollero, Striga, sorgo, yuca y batata, incluida la enfermedad del mosaico y la raya parda, cacahuete, aflatoxina en maíz almacenado, mijo, tef y la enfermedad de Newcastle en avicultura rural). El modelo incorpora en su plantilla de chat un system prompt propio con instrucciones de seguridad explícitas: no prescribir dosis de pesticidas o medicamentos veterinarios y derivar al etiquetado del producto y al agrovet o veterinario local.

La relevancia actual del proyecto reside en su enfoque de despliegue y en su política de publicación: pesos en precisión completa junto a los GGUF, hashes SHA256 fijados a un commit concreto, informe técnico público y varios checkpoints intermedios para comparación. La licencia GPL-3.0, sin embargo, condiciona seriamente su adopción en productos propietarios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-1.5B-Instruct) |
| Parámetros totales | 1.543.714.304 (1,54 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (configuración de referencia en llama.cpp; contexto nativo del modelo base no disponible en la información proporcionada) |
| Tipos de cuantización | GGUF Q4_K_M (fichero principal, 940 MB); pesos en precisión completa en `checkpoints/2stage-ckpt1224/` |
| Idiomas soportados | Inglés |
| Licencia | GPL-3.0 |
| Formato de pesos | GGUF y safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de 1,54 B parámetros, y se ajusta mediante un proceso en dos etapas. La model card distingue entre `checkpoints/stage1-final/` (etapa 1) y `checkpoints/2stage-ckpt1224/` (etapa 2, el checkpoint publicado como modelo actual). El checkpoint `2stage-x-final` obtuvo puntuaciones superiores pero fue descartado por memorizar sus datos de entrenamiento, lo que indica que el autor aplicó criterios de selección basados en generalización y no solo en métricas de ajuste. La versión anterior del repositorio (`adtc-agri-Q4_K_M.gguf`) era un ajuste LoRA y se conserva únicamente como referencia.

El dataset de ajuste es `AI71ai/agrillm-train-146k`, aunque la model card describe un corpus de 6.703 filas efectivamente utilizado para el dominio agrícola. No se especifica en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF, DPO u otras técnicas de alineación posteriores al ajuste supervisado. La innovación destacable no es arquitectónica sino de despliegue y de comportamiento: la plantilla de chat inyecta un system prompt que instruye al modelo a rechazar la invención de plagas o tratamientos inexistentes y a abstenerse de prescribir dosis. La model card documenta este efecto con el caso de una plaga ficticia ("Letticea leaf miner"), ante la cual el modelo ajustado responde con una negativa explícita en 8 de 8 intentos, frente al modelo base, que genera un programa de tratamiento completo en 0 de 8.

## Capacidades

- Generación de texto conversacional en inglés con registro divulgativo, orientado a personas sin formación formal en agronomía.
- Conocimiento agronómico específico: identificación y manejo de gusano cogollero, Striga, sorgo, yuca, batata, cacahuete, mijo, tef y aflatoxina en maíz almacenado.
- Sanidad animal en avicultura rural: enfermedad de Newcastle en aves de corral de aldea.
- Recomendación de siguientes pasos con actores locales existentes (agrodealer, agrovet, agente de extensión del condado).
- Abstención calibrada ante preguntas fuera de dominio o sobre plagas inexistentes, con petición de información adicional.
- Restricción de seguridad incorporada: no proporciona dosis de pesticidas ni de medicamentos veterinarios.
- Conversación multi-turno con contexto de 4.096 tokens.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Asistencia en visitas de campo de agentes de extensión: el modelo se ejecuta en el portátil que el agente ya posee, sin red, y responde en segundos a preguntas sobre síntomas observados en el cultivo. Los 4.096 tokens de contexto permiten mantener el hilo de una visita completa con varias parcelas.
- Diagnóstico inicial de plagas y malas hierbas por descripción: el agricultor o el agente describe el daño y el modelo nombra el problema (por ejemplo, Striga en maíz) y explica por qué el fertilizante aplicado no revirtió el estancamiento.
- Consulta sobre enfermedades del cultivo de yuca: identificación de mosaico y raya parda, con orientación sobre manejo y material de siembra.
- Gestión poscosecha y aflatoxina: recomendaciones sobre almacenamiento de maíz para reducir el riesgo de contaminación por aflatoxina, un problema con implicaciones directas en salud y acceso a mercado.
- Sanidad avícola en explotaciones familiares: orientación sobre enfermedad de Newcastle y derivación al veterinario local, sin prescripción de dosis.
- Formación y divulgación: generación de explicaciones breves y prácticas (por ejemplo, rotación maíz-leguminosa y fertilidad del suelo) para talleres con agricultores sin formación formal, con control de longitud mediante instrucción.
- Despliegue en cooperativas y oficinas de extensión con hardware antiguo: 11,9 tokens/s en un Intel Core i5-7200U de 2016 y 15,7 tokens/s en 4 vCPU, con un pico de memoria de 1,07 GB, lo que permite servir consultas en un equipo compartido sin inversión en GPU.
- Integración en servicios de extensión con conectividad intermitente: el binario `llama-server` expone una API HTTP local en el puerto 8080 compatible con clientes de chat, utilizable en una red de oficina sin salida a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de despliegue:

| Métrica | Valor |
|---|---|
| Velocidad en 4 vCPU | 15,7 tokens/s |
| Velocidad en Intel Core i5-7200U (2016) | 11,9 tokens/s |
| Memoria pico | 1,07 GB |
| Tamaño del fichero GGUF Q4_K_M | 940 MB |
| Tasa de abstención ante plaga inexistente ("Letticea leaf miner") | 8/8 en AgriLLM frente a 0/8 en el modelo base |

## Requisitos de hardware

- VRAM: no requiere GPU. La inferencia de referencia se ejecuta con `-ngl 0` (todas las capas en CPU).
- Memoria RAM: aproximadamente 1,07 GB de pico con la cuantización Q4_K_M.
- CPU: cualquier x86-64 con llama.cpp. Medido en 4 vCPU (15,7 tokens/s) y en un Intel Core i5-7200U de 2016 (11,9 tokens/s).
- GPU: no necesaria; no se documentan velocidades con aceleración por GPU. Cabe en cualquier GPU consumer con más de 2 GB de VRAM si se opta por descarga parcial o total de capas, aunque no es el escenario previsto por el autor.
- Despliegue: llama.cpp (`llama-cli` para terminal, `llama-server` para API HTTP local en el puerto 8080). No se documentan integraciones con vLLM, TGI, Ollama ni otros servidores.
- Parámetros de muestreo recomendados en la demo: `--temp 0.2 --top-p 0.9 --repeat-penalty 1.15 --repeat-last-n 256 -c 4096`. Los valores por defecto embebidos en el fichero son temperatura 0,7, top-p 0,8, top-k 20 y repeat penalty 1,1.
- Entorno probado: Ubuntu 24.04 nativo y bajo WSL2 en Windows.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Despliegue |
|---|---|---|---|---|---|
| AgriLLM (este modelo) | 1,54 B | 4.096 tokens (config. de referencia) | Agronomía para África subsahariana, offline | GPL-3.0 | GGUF Q4_K_M, CPU, llama.cpp |
| Qwen2.5-1.5B-Instruct | 1,54 B | No disponible en la información proporcionada | Asistente generalista, multilingüe | No disponible en la información proporcionada | Múltiples formatos, GPU o CPU |
| Qwen2.5-7B-Instruct | 7 B (aprox.) | No disponible en la información proporcionada | Asistente generalista de mayor capacidad | No disponible en la información proporcionada | Requiere más memoria; GPU recomendada |

La comparación relevante es frente a su propio modelo base: AgriLLM sacrifica cobertura generalista y multilingüismo a cambio de precisión en dominio agrícola y de una política de abstención explícita, con un coste de inferencia que permite ejecución en CPU. Frente a modelos de 7 B o superiores, la ventaja no es de capacidad bruta sino de huella de memoria y de comportamiento seguro en el dominio. No se dispone de datos de benchmarks que permitan comparar calidad de forma cuantitativa con alternativas.

## Limitaciones y advertencias

- Licencia GPL-3.0: cualquier distribución de software que incorpore el modelo o un trabajo derivado debe publicarse bajo la misma licencia. Esto excluye de facto su integración en productos propietarios o en servicios SaaS de código cerrado sin liberar el código.
- Idioma único: solo inglés. Un modelo pensado para pequeños agricultores africanos que no cubre swahili, francés, hausa, amhárico ni otras lenguas locales limita gravemente su utilidad real en el segmento objetivo.
- Dominio muy acotado: el corpus de ajuste es de 6.703 filas. Fuera de los cultivos y plagas cubiertos, el comportamiento no está caracterizado y la calidad puede degradarse hacia la del modelo base.
- Riesgo de alucinación agronómica: aunque se documenta una mejora clara en la abstención ante plagas inexistentes, no hay evaluación sistemática publicada de tasas de alucinación en el dominio. Un consejo agronómico incorrecto puede traducirse en pérdida de cosecha.
- Riesgo de seguridad en dosis: la política de no prescribir dosis depende de la obediencia al system prompt de la plantilla de chat. Si se invoca el modelo sin dicha plantilla o con un system prompt alternativo, esa salvaguarda puede desaparecer.
- Contexto limitado a 4.096 tokens en la configuración de referencia, insuficiente para documentos técnicos extensos o historiales de conversación largos.
- Sesgos: no se documenta ninguna evaluación de sesgos. El corpus está centrado en África subsahariana y en un conjunto concreto de cultivos, lo que puede producir recomendaciones poco ajustadas a otras regiones agroclimáticas.
- Modelo de 1,54 B parámetros: capacidad de razonamiento limitada. No es adecuado para cálculos agronómicos complejos, planificación multi-paso ni razonamiento sobre tablas de datos.
- Repositorio de 27,4 GB por la inclusión de pesos en precisión completa y múltiples checkpoints; conviene descargar solo el GGUF necesario.
- Trazabilidad: el autor recomienda fijar la descarga a un commit concreto y verificar el SHA256 (`ad7e079f7cfd307edc7629a35c906cb55ed41218ba14a93e48120d81952d3e0f` para el Q4_K_M actual). No se documenta auditoría externa del dataset ni del proceso de entrenamiento.
- Advertencia de producción: el modelo no sustituye la diagnosis de un agrónomo o veterinario; su uso debe presentarse como orientación inicial con derivación a profesionales locales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shemking/agrillm-qwen2.5-1.5b-agri
- Demo en vídeo (2 minutos): https://youtu.be/oGjm1zTiEGA
- Código, informe y pruebas de entrenamiento: https://github.com/shem2019/adtc-2026-agrillm
- Informe técnico completo: https://github.com/shem2019/adtc-2026-agrillm/blob/main/REPORT_DETAILS.md
- Instrucciones de instalación y prueba: https://github.com/shem2019/adtc-2026-agrillm#try-it-yourself
- Dataset de entrenamiento: https://huggingface.co/datasets/AI71ai/agrillm-train-146k
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct

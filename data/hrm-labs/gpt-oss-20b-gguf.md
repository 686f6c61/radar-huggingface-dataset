# hrm-labs/gpt-oss-20b-GGUF

## Resumen
hrm-labs/gpt-oss-20b-GGUF es una version cuantizada en formato GGUF del modelo openai/gpt-oss-20b, un transformer con mezcla de expertos (MoE) de aproximadamente 21.000 millones de parametros totales que OpenAI publico como pesos abiertos. Este repositorio concreto, mantenido por el usuario hrm-labs, no aporta nada nuevo a nivel de arquitectura: se limita a redistribuir el modelo base convertido al formato GGUF para su uso en herramientas como llama.cpp, Ollama o llama.app. La model card es practicamente vacia (incluye un "TODO" explicito), de modo que toda la informacion tecnica relevante procede del modelo original de OpenAI.

El interes de esta ficha esta, por tanto, en describir que ofrece gpt-oss-20b y como se puede ejecutar a traves de su version GGUF. El modelo base emplea una arquitectura MoE con unos 3.600 millones de parametros activos por token (aproximadamente el 17 % del total), lo que permite obtener una calidad cercana a modelos densos mucho mayores con un coste de inferencia reducido. Su ventana de contexto alcanza los 128.000 tokens y esta licenciado bajo Apache 2.0, lo que habilita uso comercial sin restricciones adicionales.

La relevancia actual radica en que permite desplegar un modelo de razonamiento de nivel competitivo en hardware de consumo: la cuantizacion GGUF facilita ejecutarlo en GPU consumer e incluso en CPU, algo poco habitual en modelos de esta categoria. No obstante, conviene advertir que el repositorio en cuestion presenta cero descargas y cero likes en el momento de la consulta, y apenas incluye documentacion propia, por lo que para produccion seria preferible recurrir a la version oficial mantenida por ggml-org.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) |
| Parametros totales | 20.914.757.184 (~20,9 B) |
| Parametros activos | ~3,6 B por token (dato del modelo base) |
| Longitud de contexto | 128.000 tokens (modelo base) |
| Tipos de cuantizacion | GGUF (varios niveles; la model card no detalla cuales) |
| Idiomas soportados | no disponible (el modelo base esta orientado principalmente al ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Tamano del repositorio | 14,8 GB |
| Modelo base | openai/gpt-oss-20b |

## Arquitectura y entrenamiento
La arquitectura del modelo base es un transformer decoder-only con capas de mezcla de expertos (MoE). Cada capa dispone de 32 expertos con enrutamiento top-4, lo que da lugar a los aproximadamente 3.600 millones de parametros activos por token sobre un total cercano a 21.000 millones. El mecanismo de atencion alterna capas con atencion "banded" (ventana deslizante) y capas con atencion densa, y utiliza RoPE con extension YaRN para alcanzar los 128.000 tokens de contexto. Los pesos de los expertos MoE se almacenan en MXFP4 nativo, lo que reduce significativamente el uso de memoria.

En cuanto al entrenamiento, el modelo base combina ajuste supervisado con aprendizaje por refuerzo siguiendo el enfoque de los modelos de razonamiento de la serie o de OpenAI, e incorpora niveles de esfuerzo de razonamiento configurables (bajo, medio y alto). Sobre el proceso exacto de entrenamiento de este repositorio GGUF no hay informacion: la model card indica unicamente que ha sido convertido de forma automatica mediante la herramienta ggml-org/convert, sin detallar el dataset, el numero de tokens ni los metodos de alineacion empleados. No se documenta ninguna innovacion tecnica adicional especifica de esta conversion.

## Capacidades
- Generacion de texto conversacional con soporte multi-turno.
- Razonamiento con cadena de pensamiento y niveles de esfuerzo configurables (bajo, medio, alto).
- Capacidad de resolucion de problemas de codigo y matematicas, heredada del modelo base.
- Soporte nativo de tool calling y function calling.
- Adecuado para flujos de agentes y razonamiento en varios pasos.
- Soporte de salidas estructuradas (structured outputs) en el modelo base.
- Capacidades multilingues limitadas: el modelo base esta optimizado principalmente para ingles.
- Compatible con decodificacion especulativa mediante el especulador RedHatAI/gpt-oss-20b-speculator.eagle3 referenciado por el autor.
- Integracion directa con el ecosistema llama.cpp/GGUF (llama.app, Ollama, etc.).

## Casos de uso
- Asistente de codigo en local: al ejecutarse en formato GGUF sobre una GPU consumer, permite autocompletar y revisar codigo sin enviar datos a servicios externos, algo critico en entornos con requisitos de privacidad.
- Agente con tool calling en pipelines de CI/CD: el soporte nativo de function calling permite integrarlo en tareas de analisis de errores, resumen de diffs o generacion de pruebas automatizadas.
- Razonamiento matematico asistido: los niveles de esfuerzo configurables permiten ajustar el coste computacional segun la dificultad del problema, desde consultas rapidas hasta demostraciones paso a paso.
- Atencion al cliente automatizada en ingles: la ventana de 128.000 tokens del modelo base permite mantener contexto largo en conversaciones multi-turno sin perder informacion previa.
- Procesamiento de documentos extensos: resumen, extraccion de entidades y respuesta a preguntas sobre contratos, informes o articulos tecnicos que quepan en el contexto.
- Prototipado e investigacion en entornos sin conectividad: al poder ejecutarse en CPU mediante llama.cpp, es util para laboratorios o equipos que trabajan en maquinas aisladas.
- Generacion de contenido tecnico: redaccion de documentacion, notas de version o explicaciones de conceptos a partir de fragmentos de codigo o especificaciones.
- Base para fine-tuning ligero: al estar bajo Apache 2.0, puede servir como punto de partida para ajustes especificos de dominio o para destilacion hacia modelos menores.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible para este repositorio. La model card de hrm-labs/gpt-oss-20b-GGUF no incluye ninguna tabla de evaluacion (contiene un "TODO" sin completar). Para datos de rendimiento habria que consultar la documentacion oficial del modelo base openai/gpt-oss-20b, que no forma parte de la informacion proporcionada en esta ficha.

## Requisitos de hardware
- VRAM estimada: en torno a 16 GB para el modelo base en MXFP4; las cuantizaciones GGUF pueden reducir el requisito segun el nivel elegido (el repositorio completo ocupa 14,8 GB, de modo que las variantes cuantizadas individuales seran menores).
- GPU recomendadas: A100, H100, L40S o RTX 4090 para un rendimiento optimo; cualquier GPU con 16-24 GB de VRAM deberia poder ejecutarlo.
- Viabilidad en GPU consumer: si, esta disenado para caber en tarjetas de gama alta para consumidores (RTX 3090, 4090) e incluso en configuraciones con menos VRAM usando cuantizaciones agresivas.
- Ejecucion en CPU: posible a traves de llama.cpp, aunque con latencia notablemente mayor.
- Opciones de despliegue: llama.cpp, llama.app (`llama serve -hf ...`), Ollama, y servidores compatibles con endpoints. Tambien vLLM y TGI si se usa la version en safetensors del modelo base.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| hrm-labs/gpt-oss-20b-GGUF | ~20,9 B | ~3,6 B | 128.000 | Apache 2.0 | GGUF |
| openai/gpt-oss-120b | ~117 B | ~5,1 B | 128.000 | Apache 2.0 | safetensors / MXFP4 |
| Llama 3.3 70B | 70 B | 70 B (denso) | 128.000 | Llama Community | safetensors / GGUF |
| Qwen2.5 32B | 32 B | 32 B (denso) | 128.000 | Apache 2.0 | safetensors / GGUF |

Los datos de parametros activos y contexto del modelo base y de los modelos comparados provienen de su documentacion publica; el rendimiento relativo no puede compararse numericamente porque no se dispone de benchmarks en la informacion facilitada para este repositorio.

## Limitaciones y advertencias
- La model card de este repositorio es practicamente inexistente (contiene un "TODO" sin rellenar) y no documenta el proceso de cuantizacion ni los niveles ofrecidos.
- El repositorio registra cero descargas y cero likes, sin historial de uso que permita validar su fiabilidad; para produccion se recomienda la version oficial de ggml-org.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en tareas factuales o de calculo preciso.
- Idiomas: el modelo base esta optimizado para ingles, con capacidades multilingues limitadas y no documentadas para este repositorio.
- Sesgos: no hay informacion sobre evaluaciones de sesgo en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y la atribucion correspondiente.
- La fecha de creacion del repositorio figura como 2026-10-12, lo que resulta incoherente con la actualidad y sugiere metadatos poco fiables.
- El rendimiento de las cuantizaciones GGUF puede degradar ligeramente la calidad respecto al modelo original en MXFP4; no se aportan mediciones al respecto.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/hrm-labs/gpt-oss-20b-GGUF
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Especulador EAGLE3: https://huggingface.co/RedHatAI/gpt-oss-20b-speculator.eagle3
- Version oficial GGUF: https://huggingface.co/ggml-org/gpt-oss-20b-GGUF
- Herramienta de conversion: https://github.com/ggml-org/convert
- Cliente de ejecucion: https://llama.app

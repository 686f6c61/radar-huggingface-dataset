# ArchiveStudio/MiniCPM5-2B-Midtrain

## Resumen

MiniCPM5-2B-Midtrain es un modelo de lenguaje denso de aproximadamente 2,5 mil millones de parámetros publicado por ArchiveStudio en Hugging Face, basado en la serie MiniCPM5 desarrollada por OpenBMB. Se trata del segundo modelo de la familia MiniCPM5, tras MiniCPM5-1B, y sigue la misma receta de entrenamiento escalada a 2B. Está diseñado específicamente para despliegue en dispositivo (on-device), ejecución local y escenarios con recursos limitados, donde pretende alcanzar el estado del arte dentro de la clase de modelos de 2B.

El modelo se entrena con la familia de datasets UltraData de OpenBMB (Ultra-FineWeb, UltraData-Math, UltraData-Code y conjuntos SFT y RL), y destaca según su ficha en razonamiento de código, matemáticas, comprensión de contexto largo, uso de herramientas y tareas agénticas, manteniendo competitividad frente a modelos de 4B.

El sufijo "Midtrain" en el nombre sugiere que se trata de un checkpoint intermedio del proceso de entrenamiento (fase de mid-training), no del modelo final alineado, algo que conviene tener en cuenta al evaluarlo para producción. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura base Llama, según tags del repo) |
| Parametros totales | 2.516.756.480 (~2,5B) |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | no disponible (el modelo se promociona con capacidades de contexto largo, pero la cifra exacta no se indica) |
| Tipos de cuantizacion | no disponible (el repo publica pesos en safetensors; no se mencionan versiones cuantizadas oficiales) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers y text-generation-inference) |

## Arquitectura y entrenamiento

MiniCPM5-2B es un transformer denso de 2B que reutiliza la arquitectura base tipo Llama y escala la receta de entrenamiento empleada en MiniCPM5-1B. Al no ser un modelo de mezcla de expertos (MoE), todos sus ~2,5 mil millones de parámetros están activos en cada pasada de inferencia, lo que simplifica el despliegue y hace el coste por token predecible.

El entrenamiento se apoya en la familia de datasets UltraData de OpenBMB: Ultra-FineWeb y Ultra-FineWeb-L3 para preentrenamiento con datos web de alta calidad, UltraX-Preview, UltraData-Math para matemáticas, UltraData-Code para código, UltraData-SFT-2605 y UltraData-SFT-Agent-2609 para ajuste por instrucciones y capacidades agénticas, y UltraData-RL-2609 para la fase de aprendizaje por refuerzo. El número total de tokens de entrenamiento no se detalla en la información disponible. El nombre "Midtrain" indica que este checkpoint corresponde a una fase intermedia del pipeline de entrenamiento, por lo que puede no incluir el alineamiento final completo (RLHF/DPO) del modelo definitivo.

## Capacidades

- Generacion de texto conversacional en inglés y chino (pipeline text-generation).
- Razonamiento de codigo: ventaja declarada frente a modelos de tamaño comparable según la model card.
- Razonamiento matematico: entrenamiento específico con UltraData-Math.
- Comprension de contexto largo: destacada como una de las dimensiones fuertes del modelo (long-context).
- Tool calling / uso de herramientas: el modelo incluye soporte de llamada a herramientas (tag tool-calling) y entrenamiento con datos SFT de agente (UltraData-SFT-Agent-2609).
- Tareas agenticas y razonamiento multi-paso: reforzadas mediante la fase RL con UltraData-RL-2609.
- Despliegue en dispositivo: optimizado para ejecución local y entornos con recursos limitados (edge AI).
- Sin capacidades multimodales documentadas: no hay evidencia de soporte de vision o audio en la informacion disponible.

## Casos de uso

- Asistentes locales en dispositivos edge: con ~2,5B de parámetros y pesos en safetensors, el modelo puede ejecutarse en hardware modesto, siendo adecuado para asistentes offline en portátiles, mini-PC o SBCs.
- Atencion al cliente automatizada en inglés y chino: su entrenamiento conversacional y con datos SFT le permite gestionar diálogos multi-turno; el soporte de contexto largo ayuda a mantener historiales extensos de conversación.
- Generacion y asistencia de codigo en entornos restringidos: gracias al entrenamiento con UltraData-Code, puede integrarse en completado de código local (por ejemplo, en IDEs con backends tipo llama.cpp) sin enviar código a la nube.
- Orquestacion de agentes con tool calling: el entrenamiento agéntico (SFT-Agent y RL) lo hace candidato para pipelines de agentes que invocan funciones, APIs o herramientas en flujos multi-paso.
- Resumen y analisis de documentos largos: la capacidad de contexto largo declarada lo hace útil para procesar documentos extensos en inglés o chino en local.
- Prototipado e investigacion: al ser un checkpoint de mid-training con licencia Apache-2.0, es util para estudiar el efecto de las fases intermedias de entrenamiento y los datasets UltraData.
- Automatizacion de tareas matematicas ligeras: el entrenamiento con UltraData-Math permite resolver problemas aritméticos y de razonamiento cuantitativo de dificultad moderada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma que el modelo alcanza SOTA open-source en su clase de 2B y que es competitivo con modelos de 4B en codigo, matematicas, contexto largo, uso de herramientas y tareas agenticas, pero no incluye cifras concretas (MMLU, HumanEval, GSM8K, etc.) en el contenido proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 5-6 GB solo para los pesos (el repo ocupa 5,0 GB), mas overhead de KV cache y activaciones; con contexto largo la VRAM necesaria crecera significativamente.
- Con cuantizacion (por ejemplo, a 4 bits, si se generan pesos GGUF o AWQ de terceros): en torno a 1,5-2 GB, aunque no hay versiones cuantizadas oficiales en el repo.
- GPU recomendadas: cualquier GPU de consumo con 6-8 GB de VRAM (RTX 3060, RTX 4060 Ti, RTX 4070) es suficiente para inferencia en precision completa; no se requieren A100 ni H100.
- Consumer GPU: si cabe; al ser un modelo de ~2,5B, es de los mas accesibles para hardware de consumo e incluso para ejecucion parcialmente en CPU.
- Opciones de despliegue: transformers (libreria nativa declarada), text-generation-inference (tag endpoints_compatible); por su arquitectura base tipo Llama, es probable la compatibilidad con vLLM, llama.cpp y Ollama, aunque no se documenta explicitamente en la informacion disponible.
- Latencia y throughput: no disponible; al ser un modelo denso de 2,5B, se espera latencia baja y buen throughput en GPU de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| MiniCPM5-2B-Midtrain | ~2,5B | Transformer denso (base Llama) | no disponible | Apache-2.0 | Checkpoint de mid-training; fuerte en codigo, matematicas, tool calling y contexto largo |
| MiniCPM5-1B (OpenBMB) | ~1B | Transformer denso | no disponible | no disponible | Modelo previo de la serie, misma receta de entrenamiento a menor escala |
| Qwen2.5-1.5B-Instruct | 1,5B | Transformer denso | 32K (dato publico) | Qwen Research / Apache-2.0 (variantes) | Competidor habitual en la clase sub-2B, con soporte multilingue amplio |

Nota: la comparacion se limita a modelos de la misma serie y alternativas representativas de la clase sub-3B; la model card no proporciona la lista exacta de modelos contra los que se comparó para afirmar el SOTA de 2B.

## Limitaciones y advertencias

- Checkpoint de mid-training: al tratarse de una fase intermedia del entrenamiento, el modelo puede presentar menor alineacion con instrucciones y mas comportamientos crudos que la version final; conviene validar antes de usar en produccion.
- Sesgos conocidos: no disponible; no se documentan auditorias de sesgos en la informacion proporcionada.
- Riesgo de alucinacion: como todo modelo de lenguaje de 2B, es susceptible de generar contenido incorrecto con apariencia plausible; el tamano reducido agrava este riesgo en tareas de conocimiento general.
- Limitaciones de idioma: soporte oficial limitado a inglés y chino; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior.
- Contexto largo: se promociona la capacidad, pero la longitud maxima exacta no se especifica; verificarla en la configuracion del repo antes de planificar cargas con documentos extensos.
- Licencia: Apache-2.0 no impone restricciones de uso comercial relevantes, aunque los datasets de entrenamiento (UltraData) tienen sus propias licencias que conviene revisar si se reentrena o destila.
- Sin versiones cuantizadas oficiales: para despliegue en hardware muy limitado habra que recurrir a cuantizaciones de terceros, con la posible perdida de calidad asociada.
- Sin capacidades multimodales: no procesa imagenes ni audio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ArchiveStudio/MiniCPM5-2B-Midtrain
- MiniCPM Tech Report (arXiv): https://arxiv.org/pdf/2506.07900
- Articulo arXiv adicional referenciado: https://arxiv.org/abs/2602.09003
- Repositorio GitHub de MiniCPM: https://github.com/OpenBMB/MiniCPM
- Wiki de MiniCPM (chino): https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- UltraData: https://ultradata.openbmb.cn/
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-2B-Demo
- Modelo de referencia de la serie (OpenBMB): https://huggingface.co/openbmb/MiniCPM5-2B
- MiniCPM5-1B: https://huggingface.co/openbmb/MiniCPM5-1B
- README en chino del modelo oficial: https://huggingface.co/openbmb/MiniCPM5-2B/blob/main/README-cn.md

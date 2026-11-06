# ArchiveStudio/MiniCPM4-0.5B

## Resumen

MiniCPM4-0.5B es un modelo de lenguaje de 0,5 mil millones de parámetros desarrollado por OpenBMB (equipo detrás de la familia MiniCPM) y distribuido en este repositorio por el usuario ArchiveStudio. Forma parte de la serie MiniCPM4, presentada en junio de 2025, disenada especificamente para dispositivos de borde (end-side) con un enfoque obsesivo en la eficiencia: arquitectura, datos de entrenamiento, algoritmos y sistema de inferencia. El modelo pequeno de la familia se entrena sobre 1 billon (1T) de tokens, frente a los 8T del modelo insignia de 8B.

El problema que resuelve es el de ofrecer capacidades de generacion de texto y conversacion con un coste computacional minimo, de modo que pueda ejecutarse en hardware modesto (CPU, GPUs de consumo, chips de borde) sin renunciar a una calidad razonable para tareas de instruccion. Su innovacion principal es la atencion dispersa entrenable InfLLM v2, que en textos largos de hasta 128K tokens solo calcula relevancia con menos del 5% de los tokens, reduciendo drasticamente el coste de la atencion.

Este repositorio concreto presenta 433.873.920 parametros reales en safetensors (aproximadamente 0,43B, ligeramente por debajo de la denominacion comercial de 0,5B), licencia Apache 2.0 y soporte para chino e ingles. Es relevante ahora porque permite desplegar un LLM conversacional en entornos con recursos muy limitados y porque forma parte de un ecosistema mas amplio (BitCPM4, cabezas Eagle para decodificacion especulativa, CPM.cu, ArkInfer) orientado a acelerar la inferencia en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion dispersa entrenable InfLLM v2 (sparse attention) |
| Parametros totales | 433.873.920 (aproximadamente 0,43B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 128K tokens (mencionado en la descripcion de InfLLM v2) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (la familia incluye variantes ternarias BitCPM4, pero no para este checkpoint) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere trust_remote_code por custom_code) |

## Arquitectura y entrenamiento

MiniCPM4-0.5B es un transformer decoder-only con una innovacion central: InfLLM v2, un mecanismo de atencion dispersa entrenable. En lugar de calcular la atencion completa sobre todos los tokens, cada token solo computa relevancia con menos del 5% de los tokens cuando se procesan textos largos de hasta 128K, lo que reduce el coste cuadratico de la atencion a algo mucho mas manejable en dispositivos con poca memoria. El modelo se entrena sobre 1T de tokens, con datos filtrados mediante la estrategia UltraClean (derivada del dataset abierto Ultra-FineWeb) y ajuste supervisado con UltraChat v2, que cubre datos intensivos en conocimiento, razonamiento, seguimiento de instrucciones, comprension de texto largo y tool calling.

El entrenamiento incorpora optimizaciones de ingenieria como computo en baja precision FP8 y la estrategia de entrenamiento Multi-token Prediction. La familia tambien emplea Model Wind Tunnel 2.0 para la busqueda de configuraciones de escalado predictivo y BitCPM para cuantizacion ternaria extrema (aplicada en variantes separadas, no en este checkpoint). Para la inferencia, el ecosistema ofrece CPM.cu (framework CUDA con atencion dispersa, cuantizacion y muestreo especulativo) y ArkInfer (despliegue multiplataforma), ademas de cabezas Eagle para decodificacion especulativa en el modelo de 8B. Segun el autor, la familia logra mas de 5x de aceleracion en generacion sobre chips de borde tipicos.

## Capacidades

- Generacion de texto conversacional multi-turno en chino e ingles.
- Seguimiento de instrucciones, segun los datos de SFT de UltraChat v2 (que incluye datos de instrucciones).
- Razonamiento y conocimiento intensivo, cubiertos por la composicion del dataset de ajuste.
- Comprension de textos largos gracias a la atencion dispersa InfLLM v2 y su contexto de hasta 128K tokens.
- Tool calling / function calling, segun la model card (UltraChat v2 incluye datos de llamada a herramientas).
- Interfaz de chat nativa (`model.chat`) y generacion estandar (`generate`) via transformers.
- Capacidad multilingue limitada a chino e ingles.
- No se mencionan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode) para este checkpoint.

## Casos de uso

- Asistente conversacional en dispositivos de borde: el modelo, con 0,43B de parametros, puede ejecutarse en CPUs y GPUs de consumo para mantener conversaciones multi-turno con contexto largo gracias a los hasta 128K tokens y a la atencion dispersa que reduce el coste por token.
- Clasificacion y extraccion de informacion en pipelines de datos: su tamano permite procesar grandes volumenes de texto en lote con bajo coste por documento, por ejemplo para etiquetado tematico o extraccion de entidades en chino e ingles.
- Resumen de documentos largos: la ventana de 128K y la atencion dispersa entrenable lo hacen adecuado para condensar informes, articulos o transcripciones extensas en entornos con memoria limitada.
- Prototipado rapido de aplicaciones LLM: sirve como modelo de desarrollo para validar prompts, flujos de tool calling y plantillas de chat antes de migrar a modelos mayores de la misma familia (MiniCPM4-8B).
- Agentes ligeros con llamada a herramientas: los datos de tool calling de UltraChat v2 permiten integrarlo en flujos donde el modelo decide que funcion invocar, aunque con la precision limitada de un modelo de 0,43B.
- Generacion de texto asistida en local para privacidad: al poder ejecutarse en hardware propio, permite redactar borradores o responder consultas sin enviar datos a servicios en la nube.
- Filtrado y preprocesado de datasets: puede usarse para generar o depurar pares instruccion-respuesta en la construccion de datos de entrenamiento, tarea coherente con el origen del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una aceleracion de mas de 5x en generacion sobre chips de borde tipicos para la familia MiniCPM4, pero no incluye cifras de MMLU, HumanEval, GSM8K ni comparativas numericas para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: con 433.873.920 parametros, en bfloat16 el modelo ocupa aproximadamente 0,87 GB de pesos; en cuantizacion de 8 bits, alrededor de 0,43 GB; en 4 bits, aproximadamente 0,22 GB. Hay que sumar la memoria del contexto (KV cache), que crece con la longitud de secuencia aunque la atencion dispersa reduce el coste.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre es suficiente en bfloat16 para contextos moderados; tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores sobran para este modelo. Tambien es viable en A100/H100 si se comparte con otros servicios.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU de consumo moderna e incluso en GPUs integradas con memoria unificada.
- Opciones de despliegue: transformers (requiere `trust_remote_code=True` por el codigo custom), y previsiblemente vLLM, llama.cpp u Ollama si existe soporte para la arquitectura InfLLM v2; el ecosistema oficial ofrece CPM.cu y ArkInfer. La informacion proporcionada no confirma soporte explicito en cada uno de estos frameworks.
- Latencia y throughput: no disponibles. El autor indica mas de 5x de aceleracion en generacion sobre chips de borde para la familia, pero sin cifras absolutas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniCPM4-0.5B | 0,43B | hasta 128K | Apache 2.0 | Hugging Face (este repo) |
| Qwen2.5-0.5B | 0,5B | 32K (segun especificaciones publicas de Qwen2.5) | Apache 2.0 | Hugging Face |
| SmolLM2-360M | 0,36B | 8K (segun especificaciones publicas de SmolLM2) | Apache 2.0 | Hugging Face |
| MiniCPM4-8B | 8B | hasta 128K | Apache 2.0 | Hugging Face (openbmb) |

Los datos de Qwen2.5-0.5B y SmolLM2-360M se incluyen como referencia de categoria; no se dispone de comparativas de rendimiento publicadas en la informacion proporcionada para establecer diferencias numericas con MiniCPM4-0.5B. La ventaja diferencial de este modelo frente a alternativas de tamano similar es su contexto de hasta 128K con atencion dispersa, frente a ventanas mas cortas en la mayoria de modelos de su escala.

## Limitaciones y advertencias

- Riesgo de alucinacion: con solo 0,43B de parametros, la fiabilidad factual es limitada; no debe usarse como fuente de verdad sin verificacion.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion proporcionada; al entrenarse con datos web filtrados, es esperable heredar sesgos de esas fuentes.
- Limitaciones de idioma: solo chino e ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- Contexto: aunque se anuncia hasta 128K tokens, la calidad efectiva en ventanas muy largas no esta cuantificada en la informacion disponible.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo requiere `trust_remote_code=True` por incluir codigo custom, lo que implica ejecutar codigo del repositorio y conviene auditar antes de desplegar en produccion.
- Repositorio no oficial: este checkpoint lo publica el usuario ArchiveStudio (96 descargas, 0 likes), no la organizacion openbmb; para produccion conviene verificar contra el repositorio oficial `openbmb/MiniCPM4-0.5B`.
- Capacidad de tool calling y agentes: aunque los datos de entrenamiento lo cubren, la precision en llamadas a funciones de un modelo de este tamano es limitada; validar con pruebas propias.
- Sin benchmarks publicados en la informacion disponible: no es posible estimar su rendimiento relativo con rigor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ArchiveStudio/MiniCPM4-0.5B
- Repositorio oficial del modelo: https://huggingface.co/openbmb/MiniCPM4-0.5B
- GitHub del proyecto MiniCPM: https://github.com/OpenBMB/MiniCPM/
- Informe tecnico de MiniCPM4: https://github.com/OpenBMB/MiniCPM/tree/main/report/MiniCPM_4_Technical_Report.pdf
- Modelo insignia MiniCPM4-8B: https://huggingface.co/openbmb/MiniCPM4-8B
- Variante ternaria BitCPM4-0.5B: https://huggingface.co/openbmb/BitCPM4-0.5B
- Dataset Ultra-FineWeb: https://huggingface.co/datasets/openbmb/Ultra-FineWeb
- Discord del proyecto: https://discord.gg/3cGQn9b3YM

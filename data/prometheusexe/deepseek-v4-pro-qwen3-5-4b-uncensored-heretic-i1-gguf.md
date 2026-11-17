# PrometheusEXE/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-i1-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-i1-GGUF es una cuantizacion GGUF del modelo xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic, publicada por el usuario PrometheusEXE. Se trata de una variante "abliterated" o "decensored" de un modelo de 4.326.350.848 parametros (aproximadamente 4,3 mil millones) construido sobre la familia Qwen3.5 y destilado a partir de DeepSeek-V4-Pro, segun indican las etiquetas del repositorio (distillation, deepseek, qwen3_5, sft, mtp). El nombre comercial del modelo base sugiere una destilacion de capacidades de razonamiento y matematicas de un modelo mayor hacia un backbone compacto.

El repositorio contiene unicamente pesos en formato GGUF (cuantizacion tipo i1, generada con imatrix), lo que lo orienta a inferencia en CPU y GPU de consumo mediante llama.cpp y derivados (Ollama, LM Studio). El tamano total del repositorio es de 39,2 GB, coherente con multiples variantes de cuantizacion del mismo modelo de ~4,3B parametros. La licencia declarada es Apache 2.0 y el acceso esta restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face antes de descargarlo.

La relevancia de esta ficha es doble: por un lado documenta un modelo pequeno con etiquetas de razonamiento y matematicas orientado a despliegue local; por otro, advierte de que se trata de una variante "uncensored/heretic" sin benchmarks publicados, con cero descargas y cero likes en el momento de la consulta, y con datos tecnicos muy limitados mas alla de los metadatos del repositorio. Cualquier evaluacion en produccion debe hacerse con cautela y validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, segun etiquetas); detalles no disponibles |
| Parametros totales | 4.326.350.848 (~4,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con cuantizacion i1 (imatrix); niveles concretos no disponibles |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas del repositorio: qwen3_5 (backbone de la familia Qwen3.5), distillation (destilacion desde un modelo mayor, presumiblemente DeepSeek-V4-Pro), sft (ajuste supervisado) y mtp (multi-token prediction, segun la abreviatura habitual, aunque no se confirma en la documentacion). El modelo base se describe como "UNCENSORED-heretic", lo que indica un proceso de abliteration o decensoring aplicado sobre el modelo original para reducir los rechazos en dominios sensibles.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, etc.). El repositorio es exclusivamente de cuantizacion: PrometheusEXE publica pesos GGUF derivados del modelo de xtools-at, generados con imatrix (importante para preservar calidad en cuantizaciones de baja precision). No hay informacion sobre el proceso de cuantizacion, los niveles incluidos ni las perdidas de calidad medidas.

## Capacidades

- Generacion de texto conversacional en seis idiomas declarados (ingles, chino, coreano, japones, espanol y ruso).
- Razonamiento y matemeticas/STEM: las etiquetas reasoning, math y stem sugieren entrenamiento orientado a problemas de razonamiento y ciencia, aunque no hay benchmarks que lo confirmen.
- Destilacion de capacidades de un modelo mayor (DeepSeek-V4-Pro segun el nombre), lo que en teoria transfiere parte del comportamiento del profesor al alumno de 4,3B.
- Modo "uncensored/heretic": menor tasa de rechazos en peticiones que modelos alineados rechazarian; util para investigacion sobre alineacion y para dominios creativos o de ficcion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no confirmado; la etiqueta reasoning sugiere capacidad, pero sin datos verificables.
- Capacidades multimodales (vision, audio): no disponibles.

## Casos de uso

- Despliegue local en estaciones de trabajo: al ser un GGUF de ~4,3B, puede ejecutarse en CPU y en GPUs de consumo con llama.cpp u Ollama, lo que permite prototipar asistentes sin depender de la nube.
- Experimentacion en investigacion sobre alineacion: la variante "abliterated" permite estudiar el comportamiento de un modelo con rechazos reducidos y comparar con el modelo base alineado.
- Generacion creativa y ficcion: el decensoring reduce las negativas del modelo en narrativa adulta o temas sensibles, un caso de uso habitual de las variantes heretic.
- Asistencia en tareas STEM de complejidad media: con 4,3B parametros y etiquetas de math/stem, es adecuado para resolver problemas de nivel educativo y como apoyo en calculo simbolico sencillo, siempre con verificacion humana.
- Traduccion y procesamiento multilingue ligero: cubre en/zh/ko/ja/es/ru, util para pipelines de traduccion de bajo coste en esos seis idiomas.
- Chatbot de atencion al cliente en local: para despliegues con requisitos de privacidad donde los datos no pueden salir de la infraestructura, un GGUF pequeno permite servir conversaciones multi-turno en hardware modesto.
- Fine-tuning posterior y destilacion: al ser Apache 2.0, puede servir como base para SFT adicional en dominios verticales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision al no conocerse los niveles de cuantizacion incluidos. Como referencia orientativa para un modelo de ~4,3B parametros: ~2,5-3 GB en Q4, ~4-5 GB en Q8 y ~8,6 GB en FP16.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para cuantizaciones bajas (RTX 3060, RTX 4060, RTX 4070); A100/H100 no son necesarias para este tamano y solo tendrian sentido para servir muchas instancias en paralelo.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060/4060/4070 y superiores con cuantizaciones Q4-Q8; tambien en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (segun etiquetas del repo) y otros runners compatibles con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (i1-GGUF) | ~4,3B | no disponible | Apache 2.0 | GGUF | Variante uncensored, sin benchmarks publicados |
| Qwen2.5-3B / Qwen3-4B | 3-4B | 32K-128K (segun version) | Apache 2.0 | safetensors, GGUF | Modelos oficiales con benchmarks publicados y soporte amplio |
| Llama 3.2 3B | 3,2B | 128K | Llama 3.2 Community License | safetensors, GGUF | Buen equilibrio calidad/tamano, licencia con restricciones |
| Phi-3.5-mini | 3,8B | 128K | MIT | safetensors, GGUF | Fuerte en razonamiento y codigo para su tamano |

La comparacion es orientativa: no hay datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia verificable de calidad en razonamiento, matematicas o codigo.
- Modelo "uncensored/heretic": la reduccion de rechazos implica mayor riesgo de generar contenido inapropiado, danino o ilegal; requiere moderacion externa en produccion.
- Riesgo elevado de alucinacion: al ser un modelo pequeno (4,3B) y destilado, la fidelidad factica es limitada; no debe usarse como fuente de verdad sin verificacion.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin medirla empiricamente.
- Idiomas: solo seis declarados (en, zh, ko, ja, es, ru); el rendimiento en espanol no esta validado.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion a la adopcion.
- Repositorio sin traccion (0 descargas, 0 likes): no hay comunidad que valide su calidad ni reporte errores.
- Licencia Apache 2.0 declarada, pero conviene verificar que el modelo base y el proceso de decensoring no impongan restricciones adicionales no reflejadas en los metadatos.
- El nombre comercial ("DeepSeek-V4-Pro-Qwen3.5-4B") no garantiza que sea un modelo oficial de DeepSeek ni de Alibaba; es una destilacion de terceros.

## Enlaces

- Hugging Face: https://huggingface.co/PrometheusEXE/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-i1-GGUF
- Modelo base: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.

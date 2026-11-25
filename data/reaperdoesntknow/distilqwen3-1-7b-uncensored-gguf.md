# reaperdoesntknow/DistilQwen3-1.7B-uncensored-GGUF

## Resumen

DistilQwen3-1.7B-uncensored-GGUF es la variante cuantizada en formato GGUF del modelo DistilQwen3-1.7B-uncensored, desarrollado por Convergent Intelligence LLC (Research Division) bajo el identificador de Hugging Face `reaperdoesntknow`. Se trata de un modelo de lenguaje conversacional de 2.031.739.904 parametros totales (aproximadamente 2,03 mil millones), destilado a partir de un profesor de mayor tamano (Qwen3-30B-A3B, segun la documentacion del portfolio del autor) y ajustado para eliminar restricciones de rechazo, orientado a despliegue en entornos de borde (edge) y hardware de consumo.

El modelo parte de la familia Qwen3 de Alibaba, concretamente de la variante de 1.7B, y aplica un pipeline de destilacion de conocimiento que el autor denomina "Topological Knowledge Distillation" y "Discrepancy Calculus" (DISC), descrito en la model card del modelo fuente. Esta version GGUF preserva esas caracteristicas estructurales en los pesos cuantizados, de modo que el comportamiento aprendido no depende de la precision numerica original en BF16.

Su relevancia actual radica en tres factores: el tamano reducido (apto para GPU de consumo e incluso CPU), la licencia Apache 2.0 (permisiva para uso comercial) y la disponibilidad en GGUF, lo que permite ejecutarlo con llama.cpp, Ollama y otros runners compatibles. No obstante, la informacion publica es escasa: no se detallan idiomas soportados, benchmarks ni composicion del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-1.7B); detalles completos no disponibles |
| Parametros totales | 2.031.739.904 (aproximadamente 2,03B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (multiples niveles de cuantizacion; niveles concretos no disponibles) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 9,0 GB); el modelo base en safetensors esta en un repo separado |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de Qwen3-1.7B, con 2.031.739.904 parametros. Sobre esa base, el autor aplica un proceso de destilacion de conocimiento desde un profesor mayor (Qwen3-30B-A3B segun la documentacion del portfolio) mediante una metodologia propia denominada "Topological Knowledge Distillation", basada en un operador de discrepancia \(Df(x)\) y una descomposicion BV (variacion acotada) que, segun el autor, detecta fronteras estructurales en el espacio de representaciones durante el entrenamiento. El ajuste "uncensored" implica un entrenamiento adicional orientado a reducir los rechazos del modelo base ante peticiones sensibles.

La model card indica que esta variante GGUF conserva las caracteristicas estructurales aprendidas porque estas quedan "grabadas" en los pesos y no dependen de la precision. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO. El autor publica un documento de metodologia bajo el DOI 10.57967/hf/8165 titulado "Structure Over Scale".

## Capacidades

- Generacion de texto conversacional multi-turno (tag `conversational` en Hugging Face).
- Razonamiento basico y respuesta a instrucciones, heredado de la destilacion de Qwen3.
- Generacion de codigo y matematicas de nivel basico, limitado por el tamano de 2B parametros.
- Despliegue en entornos de borde (tag `edge`) y hardware de consumo.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita su integracion en infraestructuras de inferencia tipo Hugging Face Inference Endpoints.
- Modo "uncensored": menor tasa de rechazos ante peticiones que el modelo base rechazaria.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Capacidades de agente y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (idiomas no declarados).
- Vision, audio o modo thinking explicito: no disponible.

## Casos de uso

- Asistentes conversacionales en dispositivos locales: el tamano de 2B parametros y el formato GGUF permiten ejecutar el modelo en portatiles con GPU integrada o CPU, ofreciendo un chatbot privado sin conexion a servicios en la nube.
- Prototipado rapido de aplicaciones de chat: con licencia Apache 2.0 y pesos GGUF, un desarrollador puede integrar el modelo en una demo con Ollama o llama.cpp en minutos, sin coste de licencia.
- Filtrado y clasificacion de texto en el borde: tareas de etiquetado, resumen corto o extraccion de informacion en dispositivos con recursos limitados donde no es viable un modelo de 7B o superior.
- Generacion de codigo asistida en entornos con restricciones de privacidad: al ejecutarse localmente, el codigo del usuario no sale del equipo, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Investigacion sobre destilacion y cuantizacion: el modelo sirve como caso de estudio para evaluar como se preservan las propiedades de un pipeline de destilacion tras la cuantizacion GGUF, dado que el autor documenta explicitamente esa hipotesis.
- Experimentacion con modelos sin censura en entornos controlados: util para estudiar el comportamiento de modelos con rechazos reducidos en tareas de analisis de contenido sensible, siempre con las salvaguardas adecuadas.
- Despliegue en endpoints de bajo coste: la compatibilidad declarada con endpoints permite servir el modelo en infraestructuras economicas para cargas de baja concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB en cuantizacion Q4_K_M (estimacion a partir de los 2,03B parametros; el nivel exacto de cuantizacion no esta documentado). En Q8, alrededor de 2,2-2,5 GB; en F16, aproximadamente 4 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema, aunque las GPU de gama alta estan sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo modernas (GTX 1650 4 GB en adelante) y en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runner compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones; para esos motores habria que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles (no documentados).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DistilQwen3-1.7B-uncensored-GGUF | 2,03B | No disponible | Apache 2.0 | GGUF | Variante sin censura destilada de Qwen3 |
| Qwen3-1.7B (Alibaba) | 1,7B | 32.768 tokens (segun documentacion publica de Qwen3) | Apache 2.0 | safetensors, GGUF | Modelo base original, con alineacion estandar |
| Llama 3.2 1B Instruct (Meta) | 1,24B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Alternativa de borde con contexto amplio, licencia no comercial en la practica para grandes empresas |
| Gemma 3 1B (Google) | 1B | 32.000 tokens | Gemma Terms of Use | safetensors, GGUF | Alternativa de borde con licencia restrictiva |

La comparativa se limita a datos publicos de los modelos base; no hay benchmarks del modelo evaluado que permitan comparar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- Riesgo de alucinacion elevado: con 2B parametros, la tasa de errores factuales es significativamente mayor que en modelos de 7B o superiores.
- Sesgos conocidos: no documentados por el autor; al derivar de Qwen3 y aplicar un ajuste "uncensored", es probable que herede sesgos del modelo base y que el ajuste reduzca salvaguardas ante contenido sensible.
- Limitaciones de contexto e idioma: no se declara la longitud de contexto ni los idiomas soportados; se recomienda validar ambos antes de usar en produccion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar la licencia del modelo base Qwen3 y los terminos del pipeline de destilacion.
- Caveat de produccion: la model card incluye terminologia matematica propia ("Discrepancy Calculus", "Topological Knowledge Distillation") sin validacion independiente publicada; tratar las afirmaciones del autor con cautela.
- El ajuste "uncensored" puede generar contenido inapropiado; requiere filtros o moderacion adicionales en aplicaciones orientadas al publico.
- No hay informacion sobre tool calling ni soporte de agentes, por lo que no debe asumirse su disponibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/DistilQwen3-1.7B-uncensored-GGUF
- Modelo base (safetensors): https://huggingface.co/reaperdoesntknow/DistilQwen3-1.7B-uncensored
- Coleccion DistilQwen: https://huggingface.co/collections/reaperdoesntknow/distilqwen-69bf40ec669117e3f069ef1c
- Documento de metodologia "Structure Over Scale": https://doi.org/10.57967/hf/8165
- Perfil del autor: https://huggingface.co/reaperdoesntknow

# hogwarts-lab/hogwarts-r2-v1

## Resumen

hogwarts-r2-v1 es un modelo de lenguaje publicado por el usuario hogwarts-lab en Hugging Face, con un total de 31.273.088.876 parámetros (aproximadamente 31,3 mil millones) según los pesos en formato safetensors. La etiqueta `gemma4` sugiere que se trata de un derivado o ajuste fino de la familia Gemma 4 de Google, aunque no se dispone de documentación oficial que confirme la relación exacta ni el proceso de entrenamiento seguido. El repositorio ocupa 62,6 GB y se distribuye bajo licencia Apache 2.0, con acceso restringido que requiere aceptar condiciones en la plataforma.

El modelo no incluye información pública sobre arquitectura interna, longitud de contexto, idiomas soportados ni pipeline de inferencia. Tampoco se han publicado resultados de benchmarks ni una model card detallada en la información disponible. Esta ficha recoge únicamente los datos verificables del repositorio y marca explícitamente como "no disponible" todo aquello que no puede confirmarse, evitando inferencias no respaldadas.

Su relevancia actual es limitada desde el punto de vista práctico: se trata de una publicación reciente (23 de noviembre de 2026) sin descargas ni interacciones, con acceso restringido y sin documentación técnica. Resulta adecuado para evaluación exploratoria por parte de investigadores que puedan solicitar acceso, pero no como base para despliegues en producción sin validación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `gemma4` sugiere familia Gemma 4, sin confirmar) |
| Parámetros totales | 31.273.088.876 (~31,3 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo. La etiqueta `gemma4` en el repositorio apunta a que podría tratarse de un ajuste fino, una variante o una conversión de un modelo de la familia Gemma 4, pero no hay confirmación oficial ni detalles sobre si emplea un transformer denso, una arquitectura MoE o algún esquema híbrido. Tampoco se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF, DPO o similares.

El único dato técnico verificable, además del recuento de parámetros, es el tamaño del repositorio (62,6 GB) y el formato de pesos safetensors. Cualquier afirmación sobre innovaciones técnicas (decodificación especulativa, atención lineal, modos de razonamiento extendido) carecería de respaldo documental y, por tanto, se omite.

## Capacidades

- Generación de texto: capacidad esperable en un modelo de ~31 B, pero no verificada en la información disponible.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas en el repositorio).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Evaluación exploratoria de modelos derivados de Gemma: investigadores con acceso al repositorio pueden comparar su comportamiento frente a la versión base de Gemma 4 para detectar posibles efectos de ajuste fino, siempre que obtengan la documentación complementaria del autor.
- Pruebas de integración con safetensors: el formato de pesos permite cargar el modelo en frameworks como PyTorch o vLLM una vez descargado, lo que facilita validar pipelines de inferencia antes de comprometer recursos en producción.
- Experimentación académica con modelos de ~31 B: útil en entornos donde se quiera estudiar el comportamiento de modelos de este tamaño bajo licencia Apache 2.0, sin las restricciones de licencias más limitativas.
- Prototipado interno con acceso restringido: equipos que ya hayan aceptado las condiciones en Hugging Face pueden usar el modelo para pruebas de concepto controladas, asumiendo la ausencia de benchmarks publicados.
- Fine-tuning posterior: al estar en safetensors y con licencia Apache 2.0, es candidato para ajustes adicionales sobre dominios específicos, aunque requeriría validar primero su calidad base.
- Auditoría de licencias y procedencia: útil como caso de estudio sobre publicación de modelos con documentación mínima y acceso gated, para equipos que definan políticas internas de adopción de modelos open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (FP16/BF16): aproximadamente 62,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se necesitan 70-80 GB o más según la longitud de contexto.
- VRAM estimada en cuantización de 8 bits: en torno a 31-35 GB, viable en GPUs de 40-48 GB (A100 40 GB, L40S, A6000).
- VRAM estimada en cuantización de 4 bits: en torno a 16-20 GB, potencialmente viable en RTX 4090 (24 GB) con contexto moderado, aunque no se ha verificado compatibilidad con formatos GGUF/AWQ/GPTQ.
- GPUs recomendadas para FP16: A100 80 GB, H100 80 GB, H200; para 8 bits: A100 40 GB o L40S; para 4 bits: RTX 4090, RTX 5090 o A6000.
- Despliegue: no se especifican opciones oficiales; al ser safetensors, cabría esperar compatibilidad con vLLM, TGI o transformers, y con llama.cpp/Ollama solo si existieran conversiones a GGUF (no disponibles en la información proporcionada).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| hogwarts-r2-v1 | ~31,3 B | no disponible | Apache 2.0 | Gated en HF | Sin benchmarks ni model card |
| Gemma 2 27B | 27 B | 8K | Gemma Terms | Público en HF | Referencia de la familia; requiere aceptar términos |
| Qwen2.5 32B | 32,5 B | 128K | Apache 2.0 | Público en HF | Amplia documentación y benchmarks publicados |
| Mistral Small 24B | 24 B | 128K | Apache 2.0 | Público en HF | Alternativa europea con licencia permisiva |

La comparación se ofrece a título orientativo por rango de parámetros; no se dispone de datos de rendimiento de hogwarts-r2-v1 que permitan una comparación cuantitativa real.

## Limitaciones y advertencias

- Ausencia total de model card: no hay información sobre datos de entrenamiento, sesgos, idiomas ni evaluación, lo que impide valorar riesgos de sesgo o alucinación de forma fundamentada.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede retrasar o impedir su uso en entornos automatizados o de CI/CD.
- Sin benchmarks publicados: no es posible comparar su calidad con modelos de referencia ni justificar su elección frente a alternativas documentadas.
- Procedencia incierta: la etiqueta `gemma4` no confirma que sea un derivado oficial de Google; conviene verificar la relación con la familia Gemma y las obligaciones que pudieran derivarse de los términos originales, aunque la licencia declarada sea Apache 2.0.
- Idiomas no especificados: no se puede asumir un buen rendimiento en castellano ni en otros idiomas sin pruebas empíricas.
- Contexto desconocido: planificar despliegues con ventanas largas sin conocer el límite real puede provocar truncamientos o degradación.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin evaluación publicada no puede acotarse su magnitud.
- Uso comercial: la licencia Apache 2.0 lo permite en principio, pero la falta de documentación sobre el origen de los datos y posibles obligaciones de la familia Gemma aconseja una revisión legal previa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hogwarts-lab/hogwarts-r2-v1
- No se han encontrado papers, blogs, repositorios de código ni demos asociados al modelo en la búsqueda web realizada.

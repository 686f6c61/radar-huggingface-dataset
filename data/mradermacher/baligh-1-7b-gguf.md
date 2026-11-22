# mradermacher/Baligh-1.7B-GGUF

## Resumen

Baligh-1.7B es un modelo de lenguaje de 1.720.574.976 parametros (aproximadamente 1,7 mil millones) desarrollado por Kandil7 y especializado en arabe e islamistica. Se construye sobre la arquitectura Qwen3 mediante continued pretraining y un posterior ajuste por instrucciones con QLoRA, partiendo de un modelo base de la familia Qwen3 y adaptandolo a dominios arabes y religiosos. La version aqui descrita es la cuantizacion GGUF publicada por mradermacher, que facilita su despliegue en entornos con recursos limitados mediante llama.cpp y derivados.

El modelo se ha entrenado con un corpus compuesto por datasets arabes de gran escala como ArabicWeb24, ArabicText-Large, TheArabicPile_Dialects y CIDAR, complementados con datos de instrucciones en arabe (evol-instruct-arabic) y un corpus especifico de fatwas islamicas (islamweb-fatwa-ar). Esta combinacion busca cubrir tanto arabe moderno estandar y dialectal como terminologia religiosa islamica, un nicho poco representado en modelos generalistas.

Su relevancia actual radica en que ofrece una alternativa compacta y de licencia Apache 2.0 para aplicaciones en arabe que requieren despliegue local o en CPU, con cuantizaciones desde Q2_K (0,9 GB) hasta f16 (3,5 GB). El modelo esta etiquetado para arabe e ingles, aunque la model card no detalla la composicion exacta del dataset ni el numero de tokens de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basada en Qwen3 (continued pretraining sobre base Qwen3) |
| Parametros totales | 1.720.574.976 (1,7 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (estaticas); variantes imatrix/weighted en repo i1-GGUF |
| Idiomas soportados | Arabe (ar) e ingles (en), segun la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base original esta en formato transformers/safetensors |

## Arquitectura y entrenamiento

Baligh-1.7B emplea una arquitectura transformer decoder-only heredada de Qwen3, sobre la que se aplico continued pretraining para adaptar el modelo al dominio arabe e islamico. Posteriormente se realizo un ajuste por instrucciones mediante QLoRA, una tecnica de fine-tuning eficiente en parametros que entrena adaptadores de bajo rango sobre los pesos cuantizados. El resultado es un modelo de 1,7 B de parametros orientado a generacion de texto en contextos arabes.

Los datos de entrenamiento documentados incluyen ArabicWeb24 (corpus web arabe a gran escala), ArabicText-Large, TheArabicPile_Dialects (variedades dialectales), CIDAR (instrucciones en arabe), evol-instruct-arabic (instrucciones evolucionadas) e islamweb-fatwa-ar (fatwas islamicas). No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detallan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto en arabe e ingles, con especial enfasis en contenido arabe moderno, dialectal y religioso islamico.
- Ajuste por instrucciones orientado a tareas de respuesta a preguntas y generacion guiada.
- Cobertura de terminologia islamica y fatwas gracias al corpus especifico islamweb-fatwa-ar.
- Manejo de variedades dialectales arabes por la inclusion de TheArabicPile_Dialects.
- Capacidad de ejecucion en entornos locales mediante cuantizacion GGUF (llama.cpp y compatibles).
- No se documenta soporte explicito de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Atencion al cliente en arabe: el modelo puede gestionar conversaciones multi-turno en arabe moderno y dialectal, adecuado para centros de soporte que atienden a usuarios de distintas regiones arabofonas, con despliegue local por su tamano reducido.
- Consultas sobre jurisprudencia islamica: gracias al corpus islamweb-fatwa-ar, puede asistir en la recuperacion y redaccion de respuestas sobre cuestiones religiosas, siempre con supervision humana por el riesgo de alucinacion en materia normativa.
- Generacion de contenido editorial en arabe: redaccion de articulos, resumenes y textos divulgativos en arabe, aprovechando su continued pretraining sobre ArabicWeb24.
- Procesamiento de textos dialectales: normalizacion o adaptacion de contenido en variedades arabes regionales para su publicacion en arabe estandar.
- Despliegue en dispositivos de bajos recursos: con cuantizaciones Q4_K_M (1,2 GB) o Q2_K (0,9 GB) puede ejecutarse en CPU o GPUs de gama baja, util para prototipos y aplicaciones embebidas.
- Educacion y formacion religiosa: generacion de material didactico y respuestas explicativas sobre textos islamicos, con cuantizacion Q8_0 (1,9 GB) para mayor fidelidad.
- Investigacion en NLP arabe: modelo de referencia pequeno para experimentos de fine-tuning o evaluacion en tareas arabes, al ser Apache 2.0 y de tamano manejable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB con Q2_K, 1,2 GB con Q4_K_M, 1,5 GB con Q6_K y 1,9 GB con Q8_0; 3,5 GB con f16. El modelo base en safetensors requiere del orden de 3,5 GB en f16.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM para cuantizaciones bajas (GTX 1050 Ti, RTX 3050, RTX 4060); para f16 se recomienda al menos 4 GB (GTX 1650, RTX 3050). En GPU de datacenter (A100, H100) el modelo es sobredimensionado para su tamano y no aprovecha su capacidad.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer modernas con cuantizacion Q4 o superior; tambien puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El modelo base en formato transformers puede servirse con vLLM o TGI, aunque no se documentan configuraciones especificas.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Baligh-1.7B | 1,7 B | No disponible | Apache 2.0 | GGUF, safetensors | Especializado en arabe e islamistica, base Qwen3 |
| Qwen3-1.7B | 1,7 B | No disponible | Apache 2.0 | safetensors, GGUF | Modelo generalista multilingue del que deriva Baligh |
| Fanar-1-9B | 9 B | No disponible | No disponible | No disponible | Modelo arabe de mayor tamano, no comparable directamente por escala |
| ALLaM-7B | 7 B | No disponible | No disponible | No disponible | Modelo arabe de SDAIA, mayor escala |

La comparacion con modelos arabes especificos de mayor tamano (Fanar, ALLaM) no es directa por diferencia de escala; Baligh-1.7B compite en el segmento de modelos compactos donde la eficiencia de despliegue prima sobre el rendimiento bruto. No se dispone de datos de benchmarks para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Riesgo de alucinacion en materia religiosa: el corpus de fatwas puede inducir al modelo a generar respuestas normativas incorrectas o desactualizadas; requiere supervision humana en contextos de jurisprudencia islamica.
- Sesgos potenciales derivados de los corpus web (ArabicWeb24) y de las fuentes de fatwas, que pueden reflejar posiciones doctrinales particulares.
- Cobertura limitada fuera del arabe y el ingles; el rendimiento en otras lenguas no esta documentado y probablemente sea deficiente.
- Longitud de contexto no documentada: no se puede garantizar el manejo de conversaciones o documentos largos sin verificacion previa.
- Ajuste por QLoRA sobre un modelo de 1,7 B: la capacidad de razonamiento complejo y codigo es limitada en comparacion con modelos de mayor escala.
- Aunque la licencia es Apache 2.0, el uso comercial de contenido religioso generado debe acompanarse de revision y responsabilidad editorial.
- La model card no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset, lo que dificulta evaluar la cobertura real del dominio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Baligh-1.7B-GGUF
- Modelo base original: https://huggingface.co/Kandil7/Baligh-1.7B
- Cuantizaciones imatrix/weighted: https://huggingface.co/mradermacher/Baligh-1.7B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Baligh-1.7B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset ArabicWeb24: https://huggingface.co/datasets/lightonai/ArabicWeb24
- Dataset ArabicText-Large: https://huggingface.co/datasets/Jr23xd23/ArabicText-Large
- Dataset TheArabicPile_Dialects: https://huggingface.co/datasets/premio-ai/TheArabicPile_Dialects
- Dataset CIDAR: https://huggingface.co/datasets/arbml/CIDAR
- Dataset evol-instruct-arabic: https://huggingface.co/datasets/FreedomIntelligence/evol-instruct-arabic
- Dataset islamweb-fatwa-ar: https://huggingface.co/datasets/Kandil7/islamweb-fatwa-ar

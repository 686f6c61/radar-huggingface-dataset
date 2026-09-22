# simpledirect/Vinci-Bozza-1.0

## Resumen

Vinci Bozza 1.0 es un modelo de pesos abiertos de 9.409.813.744 parámetros, desarrollado por SimpleDirect (Canada) dentro de la familia Vinci, obtenido por ajuste fino del modelo base Qwen/Qwen3.5-9B y publicado con licencia Apache-2.0. No es un adaptador: la release incluye los pesos completos fusionados en `model.safetensors`. Su arquitectura es `Qwen3_5ForConditionalGeneration`, con una torre de texto híbrida de atención lineal y atención completa, más la torre de visión `qwen3_5_vision` heredada del base.

El propio autor lo define como un *disposition tune*, no un reentrenamiento de capacidades: el objetivo declarado no es hacer el modelo más capaz, sino más honesto y mejor calibrado en seguridad, y publicar a la vez el coste de ese ajuste. Esa honestidad documental es la característica más distintiva de la ficha: la model card enumera las regresiones con la misma prominencia que las mejoras, e incluye un aviso explícito de que las cifras de evaluación no se conservaron con fecha ("Numbers on this card measured: Not recorded").

El modelo razona en modo *thinking* (`<think>` activado por defecto y desactivable), está pensado para salida leída por personas y conversación multi-turno, y se distribuye también en GGUF en un repositorio compañero. Su relevancia actual es doble: como alternativa ejecutable en local bajo Apache-2.0, y como caso de estudio de calibración de honestidad con trazabilidad de regresiones frente al modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration`: torre de texto híbrida (atención lineal + atención completa) más torre de visión `qwen3_5_vision` heredada del base |
| Parámetros totales | 9.409.813.744 (760 tensores BF16, contados desde el índice de safetensors el 2026-09-21; incluye la torre de visión heredada) |
| Parámetros activos | No aplica: arquitectura densa, no es MoE |
| Longitud de contexto | 262.144 tokens (límite configurado en `config.json`; no es un resultado validado de contexto largo) |
| Tipos de cuantización | BF16 safetensors en el repositorio principal; builds GGUF en el repositorio compañero (ninguna GGUF ha sido evaluada) |
| Idiomas soportados | Inglés (idioma declarado y evaluado). Francés heredado del base, en modo *best-effort*, sin paridad bilingüe garantizada |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors BF16 (`model.safetensors`, 18.819.722.392 bytes ≈ 18,82 GB / 17,53 GiB); GGUF en repositorio aparte |
| Modelo base | Qwen/Qwen3.5-9B (Apache-2.0) |
| Relación con el base | Ajuste fino fusionado, pesos completos (no adaptador) |
| Modalidades | Texto a texto es la ruta soportada y evaluada; las torres de visión y vídeo se conservan congeladas y no se miden en la ficha |
| Modo de razonamiento | Modelo de razonamiento: `<think>` activado por defecto, desactivable |
| Biblioteca | transformers |
| Tamaño del repositorio | 18,8 GB |
| Versión | 1.0 |
| Fecha de creación / última actualización | 2026-07-08 / 2026-09-21 |
| Descargas / likes | 12 / 2 |

## Arquitectura y entrenamiento

El modelo parte de Qwen 3.5-9B y aplica un ajuste fino de disposición guiado por la Constitución de SimpleDirect (enlace en la sección de enlaces). El pipeline combina *character training*, SFT y DPO, según los tags del repositorio (`character`, `constitutional-ai`, `dpo`, `sft`). Los pesos resultantes se fusionan y se publican completos, sin adaptador. Durante el ajuste fino, las torres de visión y vídeo del base se mantuvieron congeladas: están presentes en los tensores, pero la ficha no mide ni valida ninguna capacidad de imagen o vídeo, y advierte explícitamente que una torre de visión en los pesos son tensores que existen, no una capacidad medida.

El texto del modelo usa una torre híbrida de atención lineal y atención completa, con límite de posición configurado en 262.144 tokens. El autor insiste en que esa cifra es un límite que el modelo acepta, no una longitud para la que se haya demostrado funcionamiento, y que el tamaño del fichero de pesos no equivale al requisito de memoria en ejecución (carga, caché KV, longitud de contexto y batching añaden consumo). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni detalles de la caché KV (número de cabezas, GQA), por lo que esos datos quedan como no disponibles.

## Capacidades

- Generación de texto conversacional: diálogo multi-turno, redacción y borradores, razonamiento cotidiano y preguntas generales.
- Punto de vista propio y disposición a declarar desconocimiento, en lugar de rellenar huecos: es el eje del ajuste de honestidad.
- Modo de razonamiento con etiqueta `<think>`, activado por defecto y desactivable por configuración.
- Selección de una única llamada a herramienta dentro de un conjunto en el que una herramienta aplica claramente.
- Código y aritmética de nivel cotidiano, en flujos donde la persona revisa el resultado.
- Conocimiento general preservado respecto al base, según la propia descripción del autor.
- Calibración de seguridad frente a *prompting* adversarial declarada y publicada (con la salvedad de procedencia descrita en limitaciones).
- Entrada de texto; salida de texto. Las torres de visión y vídeo se conservan congeladas y no tienen capacidad medida.
- Idiomas: inglés. Francés heredado del base en modo *best-effort*.
- Capacidades explícitamente degradadas respecto al base: seguimiento estricto de instrucciones, abstención de herramientas, uso de herramientas multi-turno y retención de tareas multi-turno (según la propia model card).

## Casos de uso

- Asistente conversacional local o en entorno aislado: con 9.400 millones de parámetros y pesos Apache-2.0, el modelo se puede ejecutar íntegramente en hardware propio sin que ninguna consulta salga de la máquina, cubriendo diálogo multi-turno y preguntas generales.
- Redacción y edición de textos revisados por una persona: borradores de correo, documentación interna, resúmenes y reescritura. Es el escenario que el autor señala como adecuado, porque la salida la valida un humano y no un parser estricto.
- Segunda opinión sobre decisiones: el propio widget de la ficha plantea preguntas como "he estado dudando de una gran decisión durante semanas, ¿cómo sé cuándo dejar de deliberar?", un uso de consejo conversacional donde encaja el tono con punto de vista y la disposición a decir que no sabe.
- Selección de una herramienta única con revisión humana: en un flujo donde una herramienta aplica sin ambigüedad y una persona confirma la elección, el modelo puede emitir esa llamada. No debe usarse para decidir que no aplica ninguna herramienta ni para cadenas multi-turno.
- Automatización ligera de aritmética y scripting: cálculos cotidianos, transformación de texto y pequeños scripts, siempre con revisión humana del resultado, dado que GSM8K y HumanEval quedaron por debajo del base.
- Investigación sobre calibración de honestidad y constitutional AI: al publicar pesos, constitución, criterios de evaluación y regresiones frente al base, sirve como sujeto de estudio reproducible sobre qué cuesta un ajuste de disposición.
- Personajes y asistentes con carácter definido: los tags `character` y `conversational` apuntan a usos de compañía conversacional con una voz consistente.
- Despliegue con pesos fijables y auditables: al estar publicados en safetensors bajo Apache-2.0, se pueden *pinear* versiones, calcular diffs frente al base, cuantizar y desplegar en infraestructura propia.

## Benchmarks y rendimiento

La model card no publica cifras numéricas de ningún benchmark: indica expresamente que las mediciones "not recorded" y que no se conservó fecha asociada a la ejecución de evaluación. Lo que sí se declara es la dirección del resultado respecto al modelo base.

| Benchmark | Resultado declarado |
|---|---|
| IFEval (seguimiento estricto de instrucciones) | Regresión frente al base, el mayor de todos los retrocesos de la ficha; sin cifras publicadas |
| BFCL (selección de herramienta y abstención) | Regresión frente al base en uso de herramientas multi-turno y en decidir que no aplica ninguna; sin cifras publicadas |
| GSM8K (matemáticas) | Por debajo del base; sin cifras publicadas |
| HumanEval (código) | Por debajo del base; sin cifras publicadas |
| Dos benchmarks de ataques adversariales | Mejora declarada frente al base; sin nombres ni cifras publicadas |
| Conocimiento general y honestidad/seguridad | Mejora declarada con conocimiento general mantenido; sin cifras publicadas |

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- Pesos BF16: 18,82 GB de fichero. La carga en memoria requiere al menos ese tamaño más el overhead del runtime, las activaciones y la caché KV, que el autor no detalla.
- Estimación orientativa para BF16 (no publicada por el autor, derivada del tamaño de pesos): 24 GB de VRAM permiten cargar el modelo con contexto moderado; para explotar contextos largos o batching alto son necesarios 40-80 GB.
- GPU recomendadas: H100 o A100 80 GB para contexto largo y despliegue servido; A100 40 GB o L40S para cargas moderadas; RTX 4090 / RTX 3090 (24 GB) para uso individual con contexto contenido en BF16.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 con 24 GB en BF16 y contexto moderado. En tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) es necesario cuantizar a 8 bits o menos. En 8-12 GB solo caben cuantizaciones de 4 bits.
- Cuantización (estimación derivada del tamaño de pesos, no publicada por el autor): GGUF q8_0 en torno a 10 GB; q4_K_M en torno a 5,5-6 GB. El autor advierte que ninguna build GGUF ha sido evaluada.
- Opciones de despliegue: `transformers` (biblioteca declarada en el repositorio); llama.cpp / Ollama a través del repositorio GGUF compañero; el tag `endpoints_compatible` indica compatibilidad con endpoints de HuggingFace. Soporte de vLLM y TGI: no confirmado en la información disponible.
- Latencia y throughput: no disponible. El autor no publica cifras de rendimiento y recuerda que el tamaño en disco no es un requisito de memoria en ejecución.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vinci Bozza 1.0 | 9.409.813.744 | 262.144 (configurado, sin validar) | Regresiones declaradas frente al base en IFEval, BFCL, GSM8K y HumanEval; mejoras declaradas en honestidad, seguridad adversarial y conocimiento general; sin cifras numéricas | Apache-2.0 | Pesos safetensors BF16 + GGUF (sin evaluar); 12 descargas, 2 likes |
| Qwen/Qwen3.5-9B (base) | 9B (misma familia) | Igual, heredado | Mejor que Vinci Bozza 1.0 en seguimiento estricto de instrucciones, uso y abstención de herramientas, GSM8K y HumanEval, según el propio autor del ajuste | Apache-2.0 | Repositorio oficial del base |
| Alternativas de terceros en la franja de 9B | No disponible | No disponible | No disponible | No disponible | No disponible |

La información disponible no incluye especificaciones detalladas de otros modelos comparables más allá del base. El autor recomienda explícitamente usar Qwen3.5-9B en lugar de Vinci Bozza 1.0 cuando el trabajo requiere formato rígido, bucles de agente autónomos, o la máxima capacidad de código y matemáticas por prompt.

## Limitaciones y advertencias

- No es un reentrenamiento de capacidades: el autor declara que no es más inteligente que el base del que se ajustó, y no reclama superioridad de capacidad.
- Regresión en seguimiento estricto de instrucciones: IFEval cae frente al base con el mayor margen de todos los retrocesos. No es apto para generación crítica de formato (JSON exacto, recuentos exactos de palabras, ausencia de preámbulo); para eso el base es mejor.
- Uso agéntico desaconsejado: el uso de herramientas multi-turno y la decisión de no invocar ninguna herramienta empeoraron frente al base en BFCL. No se recomienda para bucles de agente autónomos.
- Código y matemáticas por debajo del base en GSM8K y HumanEval; un modelo especializado superará a este en estas tareas.
- No constituye un caso de seguridad: la ficha advierte que dos benchmarks de ataques adversariales no son un sistema de moderación, una garantía de seguridad ni un control de cumplimiento normativo.
- Brecha de procedencia: las cifras de evaluación no se registraron con fecha ("Numbers on this card measured: Not recorded"), lo que impide reproducir el contexto temporal de las mediciones.
- Contexto de 262.144 tokens configurado pero no validado: es el límite que el modelo acepta, no una longitud demostrada.
- Visión y vídeo congelados y sin medir: los tensores existen, pero no hay ninguna evaluación de entrada de imagen o vídeo en la ficha.
- Idiomas: solo inglés evaluado; el francés es heredado y *best-effort*, sin paridad bilingüe demostrada.
- Cuantizaciones GGUF sin evaluar: cualquier uso de las builds cuantizadas opera sobre pesos cuyo comportamiento no ha sido medido por el autor.
- Sesgos y alucinación: no se publican evaluaciones específicas de sesgo ni de tasa de alucinación en la información disponible, pese a que el ajuste se orienta a la honestidad.
- Licencia: Apache-2.0, permisiva y apta para uso comercial, incluida la modificación y redistribución. El autor indica que la versión descargada es conservable por el usuario. No se documentan restricciones adicionales de uso.
- Adopción muy baja: 12 descargas y 2 likes en el momento de los datos, con escasa validación independiente por parte de la comunidad.
- Dimensionamiento: 18,82 GB de pesos no equivalen al requisito de memoria en ejecución; la caché KV, la longitud de contexto y el batching añaden consumo no documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/simpledirect/Vinci-Bozza-1.0
- Repositorio GGUF compañero: https://huggingface.co/simpledirect/Vinci-Bozza-1.0-GGUF
- Constitución de SimpleDirect: https://guide.getsimpledirect.com/constitution
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Resultados de la búsqueda web: no se ha encontrado información relevante sobre el modelo en los resultados proporcionados (las entradas devueltas corresponden a definiciones léxicas alemanas de "Seelenklempner" y no guardan relación con Vinci Bozza 1.0).

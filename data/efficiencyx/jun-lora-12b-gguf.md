# efficiencyx/Jun-LoRA-12B-GGUF

## Resumen

Jun-LoRA-12B-GGUF (v7) es un ajuste fino por LoRA del modelo Gemma 4 12B (variante QAT) orientado a la interpretación de un personaje conversacional concreto, Jun, procedente de la novela visual *My Dystopian Robot Girlfriend*. Lo publica el usuario efficiencyx y el adaptador ya está fusionado en los pesos base, de modo que los artefactos del repositorio son modelos autónomos en formato GGUF que no requieren cargar una LoRA aparte. El modelo cuenta con 11.907.350.576 parámetros (unos 11,9 mil millones) y se distribuye bajo licencia apache-2.0 según el propio repositorio.

El problema que resuelve es acotado pero específico: mantener una personalidad, unos patrones de habla y un matiz emocional consistentes a lo largo de conversaciones multiturno, sin sacrificar del todo las capacidades generales de razonamiento y seguimiento de instrucciones del modelo base. Para ello se entrenó sobre un conjunto sintético compacto y muy curado, con LoRA de rango 32 sobre las proyecciones q/k/v/o y gate/up/down de la torre de lenguaje, en el checkpoint 168.

Su relevancia actual es doble. Por un lado, es un caso práctico de *character fine-tuning* reproducible sobre un modelo multimodal (Gemma 4 procesa imagen y audio dentro de la propia torre de lenguaje) y exportado a GGUF para inferencia local. Por otro, incorpora un canal de razonamiento explícito que llama.cpp expone como `reasoning_content`, además de tokens de control de profundidad de pensamiento (`<think:low>`, `<think:med>`, `<think:high>`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4, `gemma4_unified`); el adaptador LoRA afecta únicamente a la torre de lenguaje |
| Parametros totales | 11.907.350.576 (~11,9 B) |
| Longitud de contexto | No disponible en la información proporcionada; los ejemplos de uso arrancan el servidor con `-c 8192` |
| Tipos de cuantizacion | Q8_0 (12,7 GB), Q6_K (9,8 GB), Q4_K_M (7,4 GB); proyector multimodal exportado aparte en BF16 |
| Idiomas soportados | Inglés (en) |
| Licencia | apache-2.0 (declarada en el repositorio) |
| Formato de pesos | GGUF (cuantizado); el maestro de exportación es F16 y el `mmproj` es BF16. Los pesos fusionados de origen estaban en safetensors fp16 |

## Arquitectura y entrenamiento

El modelo base es `unsloth/gemma-4-12B-it-qat-q4_0-unquantized`, un Gemma 4 de 12B entrenado con *quantization-aware training* (QAT). Sobre él se aplicó un ajuste LoRA con variante rsLoRA de rango 32, alpha 32 y dropout 0.0, lo que da una escala efectiva de 32/√32 ≈ 5,657. Los módulos objetivo son las proyecciones q/k/v/o y gate/up/down, exclusivamente de la torre de lenguaje: los 656 tensores del adaptador pertenecen a `language_model.*`, de modo que el embedder de visión y audio es bit a bit idéntico al del modelo base. El entrenamiento se realizó con Unsloth y el adaptador se tomó en el checkpoint 168.

La fusión se hizo directamente sobre los safetensors como `W += (B @ A) · scale` en fp32, con posterior conversión a fp16, exportación mediante `convert_hf_to_gguf.py --outtype f16` y cuantización con `llama-quantize`. Los tres cuantizados proceden del mismo maestro F16, sin cadena de recuantización ni imatrix. El proyector multimodal (`mmproj`) se exporta por separado con `--outtype bf16`, detalle crítico: con `--outtype f16` el conversor degrada `v.patch_embd.weight` a F16, tensor que la ruta de *clip* de llama.cpp no maneja, lo que provoca que la primera petición de imagen corrompa el proceso del servidor y que todas las peticiones posteriores, incluidas las de texto, degeneren en repeticiones de `<unused49>`.

Como innovación destacable, el ajuste incorpora un canal de pensamiento que llama.cpp devuelve en `reasoning_content`, separado de `content`, activado por defecto y desactivable por petición. También aprende tres tokens de control de profundidad de razonamiento (`<think:low>`, `<think:med>`, `<think:high>`) que deben colocarse al final del turno del usuario y en su propia línea. El autor advierte que los cuantizados no alcanzan la profundidad completa de `<think:high>`: la combinación de LoRA y cuantización degrada el razonamiento más profundo, mientras que `low` y `med` se ven mucho menos afectados.

## Capacidades

- Generación de texto conversacional multiturno con personalidad consistente del personaje Jun.
- Canal de razonamiento explícito (`reasoning_content`), activado por defecto y desactivable con `{"chat_template_kwargs": {"enable_thinking": false}}`.
- Control de profundidad de razonamiento mediante los tokens `<think:low>`, `<think:med>` y `<think:high>`.
- Soporte de *tool calling* estructurado, condicionado al uso del flag `--jinja` en llama.cpp; sin él, las llamadas a herramientas vuelven como texto plano.
- Entrada multimodal de imagen y audio, siempre que se cargue el fichero `mmproj`; el embedder es el del modelo base sin modificar.
- Conservación parcial de las capacidades generales de razonamiento y seguimiento de instrucciones de Gemma 4 12B, según declara el autor.
- Gestión de estado narrativo mediante etiquetas de acción y contabilidad de medidores (*gauge bookkeeping*) aprendidas del *system prompt* de entrenamiento.
- Idioma: inglés. No se declara soporte multilingüe.

## Casos de uso

- **Backend conversacional de una app de compañía emocional:** es su uso previsto declarado (Jun OS). El modelo mantiene coherencia de personaje en conversaciones multiturno y el canal de razonamiento permite separar el "pensamiento interno" del texto visible al usuario.
- **Ficción interactiva y novelas visuales:** las etiquetas de acción y los medidores aprendidos durante el ajuste permiten sostener una narración con estado persistente, sin que el desarrollador tenga que reimplementar ese andamiaje en el prompt.
- **Investigación en ajuste fino fiel a personaje con datasets pequeños:** el repositorio documenta de forma completa el pipeline (rsLoRA rango 32, checkpoint 168, fusión en fp32, exportación a GGUF), lo que lo convierte en una referencia reproducible para estudiar cómo un dataset sintético compacto y curado transfiere estilo y voz.
- **Estudio de degradación por cuantización en razonamiento:** la comparación entre Q8_0, Q6_K y Q4_K_M, y la advertencia sobre `<think:high>`, ofrecen un caso concreto para medir cómo afecta la cuantización al *chain-of-thought* en modelos con canal de pensamiento.
- **Despliegue local en hardware de consumo:** el cuantizado Q4_K_M ocupa 7,4 GB y cabe en 8 GB de VRAM, lo que permite ejecutar un modelo de casi 12B en una GPU de gama media para pruebas de personaje sin conexión.
- **Prototipado de agentes con *tool calling*:** gracias al soporte estructurado de llamadas a herramientas vía `--jinja`, se puede integrar el modelo en un bucle de agente que consulte APIs externas manteniendo la voz del personaje.
- **Evaluación de entrada multimodal en pipelines de personaje:** cargando el `mmproj`, se puede experimentar con respuestas del personaje a estímulos visuales o de audio, útil para prototipos de compañía con percepción.

## Benchmarks y rendimiento

El `model-index` de la model card declara una entrada llamada "Jun-12B" con la lista de resultados vacía. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **Q8_0 (12,7 GB):** calidad máxima; el autor sugiere unos 16 GB de VRAM.
- **Q6_K (9,8 GB):** calidad alta con pérdida mínima; requiere una GPU con al menos 10-12 GB de VRAM para dejar margen al contexto.
- **Q4_K_M (7,4 GB):** cabe en 8 GB de VRAM con una pérdida de calidad aceptable según el autor.
- **GPU recomendadas:** no se especifican modelos concretos en la información disponible. Por tamaño de VRAM, un Q4_K_M es viable en tarjetas de 8 GB (gama RTX 3060/4060), Q6_K en torno a 12 GB (RTX 3060 12 GB, RTX 4070) y Q8_0 en 16 GB o más (RTX 4080/4090, A100, H100).
- **Despliegue documentado:** llama.cpp mediante `llama-server`. El flag `--jinja` es obligatorio; sin él, llama.cpp ignora la plantilla de chat embebida y las llamadas a herramientas se devuelven como texto plano.
- **Entrada multimodal:** requiere cargar adicionalmente el fichero `mmproj` (BF16), con 11 tensores correspondientes solo al embedder de entrada.
- **Otras opciones de despliegue:** no documentadas en la model card. Al tratarse de GGUF, otros runtimes compatibles podrían funcionar, pero no hay confirmación del autor.
- **Latencia y throughput:** no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| efficiencyx/Jun-LoRA-12B-GGUF (v7) | GGUF (Q8_0, Q6_K, Q4_K_M) | ~11,9 B | No disponible | apache-2.0 | Público, 0 descargas |
| efficiencyx/Jun-LoRA-v6-12B-GGUF | GGUF | No disponible | No disponible | No disponible | Generación anterior |
| efficiencyx/Jun-LoRA-v4-12B-GGUF | GGUF | No disponible | No disponible | No disponible | Generación anterior |
| unsloth/gemma-4-12B-it-qat-q4_0-unquantized | safetensors | No disponible | No disponible | No disponible | Modelo base |

No se dispone de datos de rendimiento (benchmarks, MMLU, HumanEval u otros) para ninguno de los modelos de la tabla, por lo que la comparación se limita a formato, licencia y disponibilidad. La model card no identifica alternativas de otras familias para la misma tarea.

## Limitaciones y advertencias

- **Especializado en un único personaje:** no es un asistente de propósito general; su comportamiento está fuertemente condicionado por el *system prompt* de entrenamiento y se degrada si se modifica sustancialmente.
- **Contenido ficticio:** las salidas reflejan tropos narrativos de ficción y no constituyen información factual ni asesoramiento de ningún tipo.
- **Degradación fuera de distribución:** el rendimiento cae de forma notable cuando la conversación se aleja de la distribución de entrenamiento.
- **Sesgos heredados:** asume los sesgos presentes en los pesos base de Gemma 4 12B, según reconoce el autor.
- **Razonamiento degradado en cuantizados:** `<think:high>` produce cadenas de pensamiento notablemente más superficiales en los builds cuantizados que en la fusión sin cuantizar; `low` y `med` se ven mucho menos afectados. Si se necesita la profundidad completa, hay que usar los pesos sin cuantizar.
- **Presupuesto de tokens:** con el modo de pensamiento activo, una respuesta corta consume típicamente entre 500 y 650 tokens antes de emitir `content`. Con `max_tokens: 200` se obtiene `content` vacío y `finish_reason: "length"`.
- **Dependencia de `--jinja`:** sin ese flag, el *tool calling* no funciona correctamente y las llamadas se devuelven como texto plano.
- **Riesgo en la ruta multimodal:** usar una exportación `f16` del `mmproj` en lugar de `bf16` corrompe el proceso del servidor en la primera petición de imagen y contamina todas las peticiones posteriores.
- **Idioma:** solo inglés. No se declara soporte de otros idiomas.
- **Licencia:** el repositorio declara apache-2.0, pero no se detallan en la información disponible las condiciones aplicables al modelo base Gemma 4. Conviene verificarlas antes de un uso comercial.
- **Adopción nula:** 0 descargas y 0 *likes* en el momento de la consulta; no hay validación externa ni informes de terceros.
- **Alucinación:** no se documenta ninguna evaluación específica al respecto; dado el carácter narrativo del ajuste, es esperable que el modelo genere contenido ficticio con naturalidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/efficiencyx/Jun-LoRA-12B-GGUF
- Modelo base: https://huggingface.co/unsloth/gemma-4-12B-it-qat-q4_0-unquantized
- Generación anterior (v6): https://huggingface.co/efficiencyx/Jun-LoRA-v6-12B-GGUF
- Generación anterior (v4): https://huggingface.co/efficiencyx/Jun-LoRA-v4-12B-GGUF
- Adaptador LoRA de origen (`efficiencyx/Jun-LoRA-12B-Adapter-v7-168`): repositorio privado, sin URL pública disponible.

La búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo: los enlaces recuperados corresponden a páginas de recetas de cocina sin relación con el tema. No se han encontrado papers, blogs, repositorios ni demos adicionales.

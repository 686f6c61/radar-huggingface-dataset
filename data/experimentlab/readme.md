# Experimentlab/README

## Resumen

`Experimentlab/README` no es una ficha de modelo ni un repositorio de pesos: es la página de presentación (README con metadatos de Hugging Face Space estático: `sdk: static`, `title`, `emoji`, `colorFrom`/`colorTo`) del espacio de la organización Experimentlab (Experimentlab.in). El repositorio no contiene configuración de modelo, tokenizador, ficheros `safetensors` ni `GGUF`, y su pipeline, licencia e idiomas figuran como no disponibles. Cualquier evaluación técnica debe dirigirse a los repositorios concretos que la card enlaza, no a este.

El texto describe la misión de Experimentlab: desarrollar modelos fundacionales de pesos abiertos y SLM orientados a ciencia, tecnología, ingeniería y matemáticas (STEM), con ejecución 100 % local y sin dependencia de la nube. La card declara tres líneas de arquitectura: mezcla de expertos dispersa (MoE de 4 expertos en tamaños de 1,5B y 3B), arquitecturas ternarias BitNet de 1,58 bits entrenadas con QAT y una serie de especializaciones de 7B derivadas de OLMo 2 (matemática pura, RTL/EDA de silicio y bioquímica/biomedicina).

Su relevancia potencial está en la propuesta de inferencia en CPU y NPU de bajo consumo mediante pesos ternarios {-1, 0, +1} y en la verificación simbólica con CAS (SymPy) integrada en el producto de escritorio Vigyan Pro. Sin embargo, en el momento de redactar esta ficha no hay artefactos, métricas ni licencia publicados en este repositorio, por lo que todas las afirmaciones de rendimiento de la card son declaraciones del autor sin verificación independiente disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en este repositorio. La card describe, para la familia enlazada: MoE disperso de 4 expertos y transformer ternario BitNet de 1,58 bits (QAT) |
| Parametros totales | No disponible. La nomenclatura de los repositorios enlazados sugiere 1,5B, 3B y 7B, sin confirmacion en artefactos |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible como artefacto. La card menciona pesos ternarios 1,58 bits y despliegue via GGUF / `bitnet.cpp` |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la card afirma "all models strictly open-weights", sin especificar licencia legal) |
| Formato de pesos | No disponible: el repositorio no contiene pesos. La card cita GGUF como formato de despliegue previsto para la linea edge |

Metadatos del repositorio: autor `Experimentlab`, etiqueta `region:us`, 0 descargas, 0 likes, creado el 2026-10-26 y actualizado el 2026-10-26 (según los metadatos proporcionados).

## Arquitectura y entrenamiento

La card no documenta la arquitectura del repositorio porque no implementa ningún modelo. Describe, a nivel de familia, dos diseños: (1) un MoE disperso con enrutado a 4 expertos en escalas de 1,5B y 3B, orientado a razonamiento STEM con memoria de inferencia reducida respecto a un denso de clase 7B; y (2) una arquitectura BitNet de 1,58 bits con pesos ternarios {-1, 0, +1} obtenidos mediante entrenamiento consciente de cuantización (QAT), que sustituye la multiplicación matricial en coma flotante por sumas enteras y permite ejecución en ARM y x86 de bajo consumo.

En cuanto a datos, la card menciona como fuentes del preentrenamiento "Vigyan Sovereign Pretraining" a Ai2 Dolma, SymPy CAS y arXiv, sin indicar número de tokens, composición porcentual del corpus, número de épocas ni si hubo fases de RLHF, DPO o ajuste por preferencias. Tampoco se detalla ninguna innovación técnica verificable (decodificación especulativa, atención lineal, presupuesto de cómputo, tamaño de vocabulario). Las especializaciones `olmo2-7b-*` se presentan como derivadas de OLMo 2 de 7B, pero no se especifica el procedimiento de ajuste, el volumen de datos de especialización ni la receta de evaluación.

## Capacidades

Todas las capacidades siguientes son declaraciones de la card sobre la familia de modelos enlazada; no son verificables en `Experimentlab/README`, que no contiene pesos ni demo ejecutable.

- Generación de texto y razonamiento científico-técnico en dominios STEM (matemáticas, física, ingeniería, química, biomedicina).
- Razonamiento matemático simbólico: la card afirma verificación determinista mediante CAS (SymPy) para cálculo simbólico, álgebra lineal y matemática discreta, aunque el mecanismo exacto de integración no se describe.
- Matemática pura y pruebas formales: topología, álgebra abstracta y demostración, según el repositorio `olmo2-7b-phd-pure-math`.
- Generación de código de hardware: Verilog/RTL, síntesis, restricciones de temporización (SDC) y verificación de lógica digital, según `olmo2-7b-silicon-rtl-eda`.
- Bioquímica computacional y modelado molecular, según `olmo2-7b-biomed-chem`.
- Ejecución totalmente offline en CPU y NPU: la propuesta de valor central, apoyada en cuantización ternaria y MoE disperso.
- Integración con herramientas de escritorio: diagramas de temporización (WaveDrom), motor CAS SymPy y RAG híbrido sobre PDF académicos locales.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Capacidades de agente y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (idiomas no declarados).
- Visión, audio o modo "thinking" explícito: no disponible.

## Casos de uso

- Tutoría STEM offline en portátiles de estudiantes: un SLM de 1,5B–3B con cuantización ternaria permitiría ejecutar resolución de ecuaciones y explicaciones paso a paso sin conexión ni GPU dedicada, lo que encaja con el objetivo declarado de "zero cloud dependence". Requiere que los pesos de `Vigyan-1.5B-4x-MoE` estén efectivamente publicados y licenciados para uso educativo.
- Cálculo simbólico asistido en laboratorio: combinación del modelo con SymPy como verificador para derivadas, integrales y sistemas lineales, de modo que el LLM proponga la forma de la solución y el CAS valide el resultado antes de mostrarlo al investigador. Es el caso que mejor se alinea con la "mathematical exactitude" que anuncia la card.
- Generación y revisión de RTL en flujos de diseño de silicio: uso de `olmo2-7b-silicon-rtl-eda` para redactar módulos Verilog, restricciones de temporización y testbenches, con revisión humana obligatoria antes de síntesis; la ventana de contexto necesaria para ficheros RTL grandes no está publicada, lo que limita la planificación.
- Documentación y estudio de bioquímica computacional: consultas sobre vías metabólicas, nomenclatura molecular y literatura biomédica en un entorno local, útil en entornos con datos sensibles o con restricciones de salida a la nube.
- Análisis de literatura con RAG local: indexación de PDF académicos y generación de respuestas con citas, tal como plantea Vigyan Pro Desktop; el cuello de botella práctico será la longitud de contexto del modelo, dato no disponible.
- Inferencia en dispositivos edge sin GPU: despliegue de la variante ternaria con `bitnet.cpp` en mini-PC, Raspberry Pi o portátiles ARM para asistentes técnicos de campo, donde el consumo energético y la ausencia de red son requisitos duros.
- Prototipado de asistentes de ingeniería en entornos air-gapped: dado el énfasis en ejecución offline, encajaría en organizaciones que no pueden enviar prompts a APIs externas (defensa, industria regulada, hospitales), siempre que la licencia lo permita, extremo no resuelto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La card no incluye cifras de MMLU, GSM8K, HumanEval, MATH, MT-Bench ni de evaluaciones específicas de STEM o RTL, ni comparaciones cuantitativas con otros modelos. Tampoco se aportan mediciones de latencia, throughput o consumo energético para las variantes ternarias o MoE.

## Requisitos de hardware

Estimaciones derivadas únicamente del número de parámetros implícito en los nombres de los repositorios enlazados; no verificadas, ya que no hay pesos ni configuración publicados.

- 1,5B (MoE de 4 expertos): ~3 GB en FP16, ~1,6 GB en INT8, ~0,9 GB en INT4, más caché KV de tamaño desconocido al no publicarse la longitud de contexto. Cabe en cualquier GPU de consumo con 8 GB (RTX 3060/4060) y en CPU moderna.
- 3B: ~6 GB en FP16, ~3,2 GB en INT8, ~1,8–2 GB en INT4. Cómodo en RTX 4060 Ti 16 GB, RTX 4090 o en CPU con 16 GB de RAM.
- 3B en formato ternario 1,58 bits: ~0,6 GB de pesos teóricos; el objetivo declarado es ejecución en CPU/NPU de bajo consumo mediante `bitnet.cpp`, sin requisito de GPU.
- 7B (serie `olmo2-7b-*`): ~14 GB en FP16, ~7,5 GB en INT8, ~4 GB en INT4. Requiere RTX 4090 / L40S / A100 para FP16 con contexto largo; viable en GPU de 8–12 GB con cuantización.
- GPU recomendadas para producción: A100 40/80 GB o H100 para servicio concurrente en FP16/BF16 de la variante 7B; L40S o RTX 4090 para nodos individuales; ninguna GPU para las variantes ternarias si se confirma el soporte de `bitnet.cpp`.
- Opciones de despliegue citadas o plausibles: `bitnet.cpp` y GGUF/llama.cpp para las variantes ternarias; vLLM o TGI para las densas de 7B; Ollama como envoltorio de conveniencia. Ninguna de estas integraciones está documentada ni validada en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de consumo en vatios.

## Comparativa con modelos similares

La comparativa se plantea frente a las familias que la propia card referencia. Los datos de las alternativas no se han verificado en esta ficha y se marcan como tales.

| Modelo | Parametros | Contexto | Licencia | Pesos disponibles |
|---|---|---|---|---|
| `Experimentlab/README` (este repositorio) | No aplica: no es un modelo | No disponible | No disponible | No: solo texto y metadatos de Space estático |
| Vigyan-1.5B-4x-MoE / Vigyan-3B-4x-MoE | 1,5B y 3B totales según nomenclatura; activos no disponibles | No disponible | No disponible | No verificado en la información proporcionada |
| vigyan-3b-1.58bit-qat | 3B según nomenclatura; ternario 1,58 bits | No disponible | No disponible | No verificado en la información proporcionada |
| Serie `olmo2-7b-*` (matemática pura, RTL/EDA, biomedicina) | 7B, presumiblemente fine-tune de OLMo 2 7B (Ai2) | No disponible | No disponible; la licencia del modelo base no se menciona | No verificado en la información proporcionada |

No se dispone de datos de rendimiento de ninguna de las filas, por lo que no es posible establecer una comparación cuantitativa con alternativas de la misma categoría (por ejemplo, otros SLM STEM de 1–3B o fine-tunes de OLMo 2). Cualquier comparación numérica sería especulativa.

## Limitaciones y advertencias

- El repositorio no contiene un modelo: no hay `config.json`, tokenizador, ficheros `safetensors` ni `GGUF`. No es ejecutable ni evaluable.
- Ausencia total de licencia: la expresión "strictly open-weights" no es una licencia legal. Sin un identificador SPDX o un texto de licencia, no se puede determinar si el uso comercial está permitido. Bloqueante para producción.
- Cero tracción verificable: 0 descargas y 0 likes en el momento de los metadatos; no hay evidencia de uso, replicación o revisión por terceros.
- Afirmaciones sin respaldo: "7B-class STEM reasoning" para un MoE de 1,5B, verificación CAS determinista y ejecución en NPU son declaraciones de marketing sin métricas, artefactos ni reproducibilidad.
- Riesgo de alucinación en dominios STEM: sin datos de evaluación en matemáticas o código, no hay garantía de corrección en pruebas formales o RTL; en estos dominios un error silencioso es más costoso que en conversación general.
- Idiomas no declarados: no hay confirmación de soporte de castellano ni de calidad multilingüe.
- Longitud de contexto desconocida: impide planificar casos de uso con documentos largos, RTL extenso o conversaciones multi-turno.
- Fechas de metadatos anómalas (creación en 2026-10-26): conviene verificar la procedencia y la vigencia del repositorio antes de citarlo.
- Posible confusión de nombres: el prefijo `olmo2-` sugiere derivación de OLMo 2 de Ai2; las obligaciones de atribución y las condiciones de la licencia del modelo base (no indicadas en la card) podrían aplicar a los derivados.
- Dependencia de un producto propietario para parte de la funcionalidad (Vigyan Pro Desktop): las capacidades de CAS y RAG parecen residir en la aplicación de escritorio, no en el modelo, lo que afecta a la portabilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Experimentlab/README
- Sitio oficial: https://experimentlab.in
- Descarga de Vigyan Pro Desktop: https://experimentlab.in/desktop
- Repositorio GitHub (Vigyan AI Ecosystem): https://github.com/shreyansh001boy-tech/vigyan_ai
- Modelo Vigyan-1.5B-4x-MoE: https://huggingface.co/Experimentlab/Vigyan-1.5B-4x-MoE
- Modelo Vigyan-3B-4x-MoE: https://huggingface.co/Experimentlab/Vigyan-3B-4x-MoE
- Modelo vigyan-3b-1.58bit-qat: https://huggingface.co/Experimentlab/vigyan-3b-1.58bit-qat
- Modelo olmo2-7b-phd-pure-math: https://huggingface.co/Experimentlab/olmo2-7b-phd-pure-math
- Modelo olmo2-7b-silicon-rtl-eda: https://huggingface.co/Experimentlab/olmo2-7b-silicon-rtl-eda
- Modelo olmo2-7b-biomed-chem: https://huggingface.co/Experimentlab/olmo2-7b-biomed-chem
- Colecciones de la organización: https://huggingface.co/collections/Experimentlab (la card enlaza esta misma URL tres veces con etiquetas distintas)
- Paper, blog técnico o demo interactiva: no disponibles en la información proporcionada.

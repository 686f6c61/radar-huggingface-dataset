# moolvylabs/Morphy-Math-1.5B-GGUF

## Resumen

Morphy-Math-1.5B es un ajuste fino del modelo Qwen2.5-Math-1.5B-Instruct orientado a matematicas superiores, fisica teorica y computacion cuantica. Lo desarrolla el equipo Moolvylabs y se distribuye exclusivamente en formato GGUF, con el objetivo de que un modelo especializado en razonamiento simbolico pueda ejecutarse en hardware de consumo. Segun la model card, es el tercer modelo de la familia Morphy y el primero centrado en ciencias formales en lugar de texto general.

El modelo conserva el tamano reducido del modelo base: 1.543.714.304 parametros totales (aproximadamente 1,5 mil millones), arquitectura transformer densa y licencia Apache-2.0. El repositorio ocupa 5,0 GB e incluye varias cuantizaciones (FP16, Q8_0, Q5_K_M y Q4_K_M) para cubrir desde GPUs de gama alta hasta equipos sin GPU dedicada. El autor declara que el ajuste se ha realizado sobre "paquetes" personalizados de matematicas avanzadas y fisica cuantica, aunque no se detalla la composicion exacta ni el volumen del dataset.

Su relevancia practica esta en el nicho: la mayoria de los modelos de 1,5B fallan en calculo simbolico multi-paso, y las alternativas con buen rendimiento matematico (7B-32B) no caben en portatiles modestos. Morphy-Math-1.5B propone cubrir ese hueco con un modelo que genera cadenas de razonamiento (CoT) paso a paso para limites, integrales impropias, ecuaciones diferenciales no lineales y notacion de Dirac. No hay resultados de benchmarks publicados, descargas registradas (0) ni likes relevantes (1), por lo que la evidencia de rendimiento disponible es unicamente la declarada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only densa (heredada de Qwen2.5-Math-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 (aproximadamente 1,5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el modelo base pertenece a la familia Qwen2.5-Math, cuya documentacion publica declara 4.096 tokens |
| Tipos de cuantizacion | FP16, Q8_0, Q5_K_M, Q4_K_M (segun la model card) |
| Idiomas soportados | Ingles (etiqueta `en`); el autor recomienda promptear en ingles para maxima precision |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (unica distribucion del repositorio) |

Otros datos: pipeline `text-generation`, etiquetas `gguf`, `mathematics`, `physics`, `morphy`, `moolvylabs`, `conversational`, `endpoints_compatible`; tamano del repositorio 5,0 GB; fecha de creacion 14 de septiembre de 2026.

## Arquitectura y entrenamiento

La arquitectura no se describe en la informacion disponible mas alla de su condicion de ajuste sobre Qwen2.5-Math-1.5B-Instruct. Se trata, por tanto, de un transformer decoder-only denso de aproximadamente 1,5B parametros, con tokenizador y configuracion heredados del modelo base de Qwen. No se documentan cambios estructurales (no hay atencion lineal, ni SSM, ni mezcla de expertos, ni decodificacion especulativa propia).

Respecto al entrenamiento, la model card indica un ajuste fino "selectivo y altamente dirigido" sobre conjuntos de datos academicos avanzados de matematicas superiores y fisica cuantica, descritos como "Custom Higher Mathematics & Quantum Physics Paks". No se especifica el numero de tokens de entrenamiento, la composicion del dataset, la mezcla de idiomas, ni si se emplearon tecnicas de alineacion adicionales como RLHF, DPO o GRPO. El autor menciona de forma explicita el uso de cadenas de razonamiento estrictas (Chain of Thought) como objetivo de comportamiento del modelo, y advierte que las cuantizaciones agresivas (Q4_K_M, Q5_K_M) pueden degradar el razonamiento en ecuaciones abstractas multivariable, mientras que FP16 y Q8_0 conservan practicamente intacta la logica del modelo.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de instrucciones tipo chat heredado de Qwen2.5-Math-Instruct.
- Razonamiento matematico paso a paso (Chain of Thought) en calculo: limites, integrales impropias, derivadas y series infinitas.
- Algebra lineal: valores y vectores propios, teorema espectral, operaciones matriciales.
- Ecuaciones diferenciales, incluidas ecuaciones no lineales como las de Bernoulli.
- Analisis tensorial y calculo multivariable, aunque el autor advierte de posible degradacion en cuantizaciones Q4_K_M y Q5_K_M en este tipo de problemas.
- Fisica avanzada y computacion cuantica: notacion bra-ket de Dirac, operadores de Pauli y transformaciones de estados cuanticos.
- Razonamiento simbolico y manipulacion de notacion cientifica avanzada.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada (el modelo base Qwen2.5-Math-Instruct no se distribuye especificamente para ello).
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; el CoT descrito es de un solo turno.
- Capacidades multimodales (vision, audio): no disponibles.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma y la recomendacion del autor.
- Modo "thinking" explicito con separacion de bloques de razonamiento: no documentado.

## Casos de uso

- Resolucion de problemas de calculo universitario: el modelo puede generar la resolucion completa de limites, integrales impropias y series, mostrando el desarrollo intermedio, lo que lo hace util como asistente de estudio o como generador de soluciones comentadas para plataformas docentes.
- Tutorizacion de algebra lineal: dado un enunciado con matrices, el modelo puede calcular valores y vectores propios y explicar el teorema espectral aplicado, con un coste de inferencia muy bajo en Q4_K_M.
- Apoyo a estudiantes de ecuaciones diferenciales: resolucion de ecuaciones de Bernoulli y otras EDO no lineales paso a paso, con la ventaja de que el modelo cabe en un portatil sin GPU dedicada.
- Generacion de ejercicios y material docente de fisica cuantica: produccion de enunciados y soluciones con notacion bra-ket, operadores de Pauli y transformaciones de estado, aprovechando el ajuste especifico en este dominio.
- Preprocesado y comprobacion de notacion cientifica: uso como primer filtro para detectar errores de indizacion o de manipulacion simbolica en expresiones LaTeX antes de pasarlas a un sistema de algebra computacional (SymPy, Mathematica).
- Asistente local en entornos sin conectividad: al distribuirse en GGUF y con ~1 GB en Q4_K_M, puede desplegarse en un equipo aislado (laboratorio, aula, portatil de campo) sin enviar datos a APIs externas.
- Prototipado rapido de pipelines de razonamiento matematico: por su tamano, sirve como modelo de pruebas para validar prompts, esquemas de CoT y formatos de salida antes de escalar a modelos de mayor tamano.
- Componente de un sistema mayor de generacion de codigo cientifico: el modelo puede redactar fragmentos de codigo numerico o derivar expresiones que despues se validan con una libreria de algebra.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, GSM8K, MATH, HumanEval ni de ninguna otra evaluacion, y la busqueda web realizada no ha devuelto resultados relevantes (unicamente paginas generales de Google sin relacion con el modelo). Las afirmaciones de rendimiento del autor ("outstanding performance", "exceptionally") son cualitativas y no estan respaldadas por numeros verificables en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contar cache KV): aproximadamente 3,1 GB en FP16; 1,7 GB en Q8_0; 1,2 GB en Q5_K_M; 1,0 GB en Q4_K_M.
- VRAM recomendada con contexto y overhead: 4-5 GB para FP16, 2,5-3 GB para Q8_0 y 2 GB o menos para Q4_K_M.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM. Una RTX 3060 de 12 GB, RTX 4060, RTX 3070, RTX 4090 o A100 pueden ejecutar el modelo sin dificultad; en estas ultimas el modelo queda limitado por memoria de sobra y el cuello de botella pasa a ser el ancho de banda.
- Cabe en GPU de consumo: si. En 4 GB de VRAM con Q4_K_M o Q5_K_M, y en 8 GB sin problemas incluso en FP16.
- Ejecucion en CPU: viable. Con Q4_K_M el modelo ocupa alrededor de 1 GB de RAM, por lo que funciona en practicamente cualquier portatil, incluidos equipos con 8 GB de RAM, e incluso en placas tipo Raspberry Pi con suficiente memoria.
- Apple Silicon: compatible a traves de llama.cpp y Ollama en equipos con memoria unificada de 8 GB o superior.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, servidores compatibles con la API de OpenAI sobre GGUF (por ejemplo `llama-server`). La etiqueta `endpoints_compatible` sugiere compatibilidad con HuggingFace Inference Endpoints en su variante de contenedor GGUF. vLLM y TGI no estan documentados como soportados para este repositorio en la informacion disponible.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Morphy-Math-1.5B (este modelo) | ~1,5B | No disponible (heredado del base) | Apache-2.0 | GGUF | Ajuste especifico en matematicas y fisica cuantica; sin benchmarks publicados |
| Qwen2.5-Math-1.5B-Instruct | ~1,5B | 4.096 tokens segun documentacion publica de la familia | Apache-2.0 | safetensors, GGUF (versiones de la comunidad) | Modelo base; orientado a matematicas, con resultados publicados en el informe tecnico de Qwen2.5-Math |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 tokens segun documentacion publica de la familia | Apache-2.0 | safetensors, GGUF | Uso general, tool calling y multilingue; peor rendimiento esperado en matematicas avanzadas |
| DeepSeek-R1-Distill-Qwen-1.5B | ~1,5B | 65.536 tokens segun documentacion publica | MIT | safetensors, GGUF | Destilado de razonamiento; compite en tareas de CoT y matematicas |

No se dispone de datos de benchmarks comparativos en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia, formato y disponibilidad. Los datos de contexto de los modelos alternativos provienen de su documentacion publica y no han sido verificados en esta busqueda.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia verificable de que el modelo supere a su base Qwen2.5-Math-1.5B-Instruct. Las afirmaciones de rendimiento proceden unicamente del autor.
- Repositorio practicamente sin adopcion: 0 descargas y 1 like en el momento de la consulta, lo que implica ausencia de validacion independiente y de reportes de errores.
- Degradacion por cuantizacion: el propio autor advierte de "minor logical degradation or index confusion" en Q4_K_M y Q5_K_M en ecuaciones abstractas multivariable, como el calculo tensorial avanzado. Para uso academico serio se recomienda FP16 o Q8_0.
- Idioma: el modelo esta etiquetado unicamente como ingles y el autor recomienda promptear en ingles para maxima precision. El rendimiento en castellano no esta documentado y previsiblemente sera inferior, especialmente en notacion simbolica.
- Riesgo de alucinacion: en tareas de razonamiento matematico multi-paso el modelo puede producir derivaciones plausibles pero incorrectas, con errores de indice o de signo dificiles de detectar sin verificacion externa. No debe usarse como unica fuente en contextos donde un error tenga consecuencias.
- Tamano limitado: con ~1,5B parametros, la capacidad de mantener razonamientos largos y coherentes es estructuralmente inferior a la de modelos de 7B o mas.
- Sin soporte multimodal ni de audio, y sin capacidades de vision para leer formulas de imagenes.
- Tool calling y uso como agente no estan documentados; asumirlos en produccion requiere validacion previa.
- Licencia Apache-2.0: permite uso comercial y modificacion sin restricciones adicionales, pero al derivar de Qwen2.5-Math-1.5B-Instruct conviene conservar los avisos de atribucion correspondientes.
- Fechas del repositorio (creacion y actualizacion en septiembre de 2026) y un unico autor sin historial verificable en la informacion disponible: conviene auditar el modelo antes de integrarlo en produccion.
- Al ser un ajuste fino no auditado, no se puede descartar la presencia de sesgos o de datos contaminados en el conjunto de entrenamiento, cuya composicion no se ha publicado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/moolvylabs/Morphy-Math-1.5B-GGUF
- Organizacion del autor: https://huggingface.co/moolvylabs
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B-Instruct
- Paper tecnico de la familia Qwen2.5-Math: referenciado en la pagina del modelo base de Qwen; no se ha localizado un enlace directo en la busqueda web realizada.

Nota: la busqueda web ejecutada no ha devuelto resultados utiles (unicamente paginas generales del buscador), por lo que no se han podido recopilar papers, blogs, repositorios ni demos adicionales sobre este modelo concreto.

# reaperdoesntknow/Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT

## Resumen

Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT es un modelo de lenguaje causal de 0,6B parametros desarrollado por reaperdoesntknow (Convergent Intelligence LLC, Research Division) a partir de Qwen/Qwen3-0.6B. El modelo se construye en dos etapas: primero una destilacion de conocimiento desde Qwen3-30B-A3B-Thinking-2507 para establecer una base de razonamiento estructurado en dominios STEM, y despues un ajuste supervisado (SFT) sobre datos de instrucciones legales del dataset Lawyer-Instruct.

La tesis del autor es que el orden de entrenamiento importa: ensenar primero *como razonar* mediante destilacion desde un profesor con trazas de deliberacion extendida, y despues ensenar *sobre que razonar* con SFT legal. El resultado es un modelo de 751.632.384 parametros reales (segun safetensors) que, segun el autor, se comprime por debajo de 500 MB al cuantizarse y puede ejecutarse en un telefono.

Es relevante por su enfoque de destilacion con perdida ponderada por prueba (Proof-Weighted Cross-Entropy al 55%) combinada con divergencia KL (45%) a temperatura T=2.0, y por su intento de transferir estructura de razonamiento desde un profesor MoE de 30B (3B activos) a un estudiante denso de 0,6B, una compresion de 50x. La ventana de contexto de entrenamiento es de solo 1024 tokens y el modelo esta etiquetado unicamente en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (causal LM, RoPE, GQA) |
| Parametros totales | 751.632.384 (0,6B nominales) |
| Parametros activos | no aplica (modelo denso; el profesor MoE tenia ~3B activos) |
| Longitud de contexto | 1024 tokens (entrenamiento) |
| Tipos de cuantizacion | no disponible (el autor menciona menos de 500 MB cuantizado, sin detallar formatos) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B, un transformer causal denso con RoPE y Grouped Query Attention (GQA). Sobre esa base se aplica una destilacion de conocimiento desde Qwen/Qwen3-30B-A3B-Thinking-2507, un modelo MoE de 30B totales con aproximadamente 3B parametros activos por token en su variante Thinking. El autor argumenta que la variante Thinking produce distribuciones softmax de mayor entropia que la Instruct, lo que a temperatura T=2.0 expone al estudiante a un paisaje mas rico de estrategias de derivacion alternativas.

La etapa 1 usa 6.122 muestras de chain-of-thought STEM en 12 dominios (Physics 2.254, Linear Algebra 667, Differential Equations 636, Electromagnetism 580, Mathematics 576, Engineering 574, Classical Mechanics 343, Theoretical Mechanics 307, Advanced Calculus 268, Modern Physics 177, Physiology 114, Molecular Biology 71), todas del autor 0xZee, con split 95/5 y semilla 42. La funcion de perdida combina Proof-Weighted Cross-Entropy (55%, con peso 2,5x sobre tokens de derivacion decayendo a 1,5x) y divergencia KL de destilacion (45%, T=2.0 escalada por T²). Hiperparametros: 1 epoca, 5.815 muestras de entrenamiento, batch efectivo 8, learning rate 1,5e-5 a 1e-6 con cosine, precision bf16. La etapa 2 aplica SFT con TRL SFTTrainer sobre Alignment-Lab-AI/Lawyer-Instruct: 1 epoca, batch efectivo 8, learning rate 5e-6 (mas bajo para preservar el backbone), gradient checkpointing activado, bf16. El autor justifica el SFT legal sobre STEM por isomorfismo estructural entre razonamiento juridico y matematico (identificacion de premisas, encadenamiento logico, manejo de excepciones).

## Capacidades

- Generacion de texto causal con formato de instruccion (`### Instruction:` / `### Response:`).
- Razonamiento STEM con derivaciones paso a paso en fisica, matematicas, algebra lineal, ecuaciones diferenciales, electromagnetismo, mecanica clasica y teorica, calculo avanzado, ingenieria y biologia (fisiologia y biologia molecular).
- Razonamiento juridico basico adquirido por SFT sobre Lawyer-Instruct.
- Generacion de chain-of-thought en formato de derivacion rigurosa (formato de la etapa 1 aun funcional segun el autor).
- Conversacion multi-turno basica (tag `conversational`).
- Orientacion a despliegue en edge (tag `edge`), con enfasis en bajo footprint.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking explicito mas alla de las trazas CoT entrenadas.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Tutoria STEM de refuerzo en dispositivos moviles: el modelo cabe, segun el autor, en menos de 500 MB cuantizado y puede ejecutarse en un telefono, lo que permite asistencia offline de derivaciones matematicas y fisicas basicas sin conexion.
- Generacion de explicaciones paso a paso para plataformas educativas: su entrenamiento con Proof-Weighted Cross-Entropy prioriza tokens de derivacion, lo que lo hace adecuado para producir explicaciones intermedias en problemas de calculo, algebra y mecanica, no solo la respuesta final.
- Primer filtro de consultas legales en aplicaciones de triaje: el SFT sobre Lawyer-Instruct le permite estructurar respuestas con premisas, excepciones y conclusion, util para clasificar o preformatear consultas antes de derivarlas a un sistema mayor o a un profesional.
- Prototipado rapido y pruebas de concepto en entornos con GPU de consumo: con 0,6B parametros y pesos safetensors, se puede cargar en bf16 en una GPU modesta o en CPU, acelerando iteraciones de prompt engineering.
- Generacion de datos sinteticos de razonamiento para destilacion posterior: puede producir trazas CoT en dominios STEM que sirvan como material de partida (con revision humana) para entrenar modelos mayores o filtrar datasets.
- Educacion en ingenieria y ciencias aplicadas: cubre dominios como electromagnetismo, ecuaciones diferenciales y mecanica teorica, util para asistentes de estudio especializados por asignatura.
- Despliegue en entornos con restricciones de privacidad: al ser pequeno y Apache 2.0, puede ejecutarse on-premise en hardware limitado sin enviar datos a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 1,5 GB para pesos (coincide con el tamano del repo de 1,5 GB) mas overhead de activaciones y cache KV; en la practica, menos de 2 GB en GPU.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,8 GB; en 4 bits, en torno a 0,4-0,5 GB (el autor afirma menos de 500 MB cuantizado, sin especificar el esquema).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para bf16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes. Tambien viable en CPU.
- Cabe en GPU de consumo: si, en practicamente todas las GPU discretas modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (referencia del autor), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); llama.cpp, Ollama y vLLM son plausibles por ser un modelo Qwen3 estandar, aunque no se documentan en la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT | 0,6B (751.632.384) | 1024 (entrenamiento) | Apache 2.0 | Destilacion STEM + SFT legal | Hugging Face |
| Qwen/Qwen3-0.6B (base) | 0,6B | no disponible en la informacion | Apache 2.0 | Modelo base generalista | Hugging Face |
| Qwen/Qwen3-30B-A3B-Thinking-2507 (profesor) | 30B totales, ~3B activos | no disponible en la informacion | no disponible en la informacion | MoE con razonamiento extendido | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparacion se limita a parametros, contexto, licencia y enfoque de entrenamiento.

## Limitaciones y advertencias

- Ventana de contexto de solo 1024 tokens en entrenamiento: insuficiente para documentos largos, conversaciones extensas o razonamientos que excedan ese limite.
- Entrenado unicamente en ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Riesgo elevado de alucinacion en dominios especializados: con 0,6B parametros y SFT de una sola epoca, las respuestas legales o cientificas pueden ser plausibles pero incorrectas.
- El SFT legal sobre Lawyer-Instruct no constituye asesoramiento juridico; no debe usarse en produccion para decisiones legales sin supervision profesional.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de Qwen3 y de datasets especificos, puede heredar sesgos de esos corpus.
- La afirmacion de "50x compresion" y "funciona en un telefono" proviene del autor y no esta respaldada por benchmarks publicados.
- El modelo es un experimento de investigacion con solo 2 likes y 2.881 descargas; madurez y soporte comunitario limitados.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluaciones de seguridad y calidad desaconseja su despliegue en produccion sin validacion previa.
- No se documentan capacidades de tool calling ni de agentes; no asumir su disponibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Profesor de destilacion: https://huggingface.co/Qwen/Qwen3-30B-A3B-Thinking-2507
- Dataset de SFT legal: https://huggingface.co/datasets/Alignment-Lab-AI/Lawyer-Instruct
- Autor de los datasets STEM: https://huggingface.co/0xZee
- Organizacion: https://convergentintel.com

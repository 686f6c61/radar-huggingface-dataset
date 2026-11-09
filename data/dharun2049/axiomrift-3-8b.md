# dharun2049/AXIOMRIFT-3.8B

## Resumen

AXIOMRIFT-3.8B es un modelo de lenguaje de aproximadamente 3.820 millones de parámetros derivado de Qwen3-4B-Instruct-2507 mediante poda estructural y posterior ajuste fino con QLoRA. Lo desarrolla el usuario dharun2049 y se publica en Hugging Face bajo la librería transformers con pesos en safetensors. Su enfoque declarado es la generación de código con un componente neuro-simbólico: el ajuste se realizó sobre programas Python y representaciones intermedias (IR) simbólicas tipadas.

El modelo conserva la arquitectura de 34 capas propia de la familia Qwen3, pero con un recorte de parámetros respecto a su base. El adaptador LoRA resultante del ajuste fino se ha fusionado en el checkpoint podado en BF16, de modo que el repositorio contiene un modelo único listo para inferencia sin necesidad de cargar el adaptador por separado. El tamaño del repositorio es de 7,7 GB.

Su relevancia actual es acotada pero concreta: se trata de un experimento de reducción de tamaño con especialización en código y estructuras simbólicas, orientado a entornos donde el coste de inferencia importa. No obstante, la información publicada es muy escasa (sin licencia declarada, sin benchmarks, sin detalle del dataset de ajuste), por lo que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3), 34 capas, podado estructuralmente desde Qwen3-4B-Instruct-2507 |
| Parametros totales | 3.820.606.464 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-4B-Instruct-2507, valor no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (checkpoint publicado en BF16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only de la familia Qwen3, y se somete a una poda estructural que reduce el número de parámetros hasta los 3.820 millones declarados, manteniendo 34 capas. Sobre ese checkpoint podado se aplica un ajuste fino supervisado con QLoRA, es decir, cuantización de bajo rango durante el entrenamiento y adaptadores LoRA de rango reducido. Finalmente, el adaptador se fusiona en los pesos en BF16, de forma que el artefacto distribuido es un modelo denso estándar.

El dominio de entrenamiento declarado son programas Python y representaciones intermedias simbólicas tipadas, lo que apunta a un ajuste orientado a tareas de traducción entre lenguaje natural, código y estructuras formales. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO adicionales. Tampoco se documentan innovaciones técnicas propias más allá de la combinación de poda estructural y QLoRA fusionado.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base instruct.
- Generación y razonamiento sobre código, con especial énfasis en Python según el dominio de ajuste.
- Producción de representaciones intermedias simbólicas tipadas (IR), capacidad declarada en la model card.
- Enfoque neuro-simbólico: combinación de generación neuronal con estructuras simbólicas intermedias.
- Soporte de tool calling / function calling: no disponible (no confirmado en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no confirmado).
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Generación de código Python en pipelines internos: el ajuste específico sobre programas Python lo hace adecuado para autocompletar funciones, generar tests o traducir especificaciones a código en entornos controlados donde el inglés sea el idioma de trabajo.
- Generación de representaciones intermedias tipadas: útil en compiladores, motores de análisis estático o sistemas de verificación formal que necesiten convertir descripciones en lenguaje natural a una IR simbólica antes de validarla.
- Asistentes de desarrollo integrados en IDE: al ser un modelo de menos de 4B parámetros, puede desplegarse en infraestructura modesta para sugerencias de código en tiempo real, siempre que se valide su calidad empíricamente.
- Prototipado de sistemas neuro-simbólicos: sirve como componente de generación en arquitecturas que combinan un LLM con un solver o verificador simbólico, dado su entrenamiento orientado a IR.
- Experimentación académica en poda y ajuste eficiente: el modelo es un caso de estudio de poda estructural más QLoRA fusionado, útil para reproducir y comparar metodologías de compresión.
- Despliegue en entornos con restricciones de memoria: sus 3,82B parámetros permiten inferencia en GPUs de consumo con cuantización, aunque el autor no publica variantes cuantizadas y habría que generarlas.
- Traducción de pseudocódigo o descripciones a estructuras formales: aplicable en herramientas de documentación técnica que necesiten normalizar especificaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 7,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 10-12 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: aproximadamente 4 GB para pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 2-2,5 GB para pesos.
- GPU recomendadas: A100, H100 o L40S para serving de alta concurrencia; RTX 4090 o RTX 3090 para inferencia en BF16 de instancia única.
- GPU de consumo: cabe en RTX 4070 Ti, RTX 4080, RTX 4090 y, con cuantización de 4 bits, en GPUs de 8 GB como RTX 3060 Ti o RTX 4060.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta endpoints_compatible), vLLM; llama.cpp y Ollama requerirían convertir los pesos a GGUF, tarea no documentada por el autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| AXIOMRIFT-3.8B | 3,82B | no disponible | no disponible | Hugging Face | Poda de Qwen3-4B + QLoRA en Python/IR |
| Qwen3-4B-Instruct-2507 | ~4B | no disponible en esta ficha | Apache 2.0 (modelo base de referencia) | Hugging Face | Modelo original sin podar; capacidades instruct generales |
| Qwen2.5-Coder-3B | ~3B | 32.768 tokens (referencia de la familia) | Apache 2.0 (referencia) | Hugging Face | Especializado en código, sin componente simbólico declarado |
| Llama-3.2-3B-Instruct | ~3,2B | 131.072 tokens (referencia de la familia) | Llama 3.2 Community License | Hugging Face | Uso general, multilingüe |

La comparación es aproximada: los datos de contexto y licencia de los modelos alternativos provienen de sus familias y deben verificarse en sus fichas oficiales. AXIOMRIFT-3.8B no publica benchmarks que permitan comparar rendimiento de forma objetiva.

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse uso comercial permitido; es un bloqueo crítico para producción.
- Sin benchmarks publicados: no hay evidencia cuantitativa de que la poda y el ajuste hayan preservado la calidad del modelo base.
- La poda estructural puede degradar capacidades generales del Qwen3-4B original, especialmente en tareas fuera del dominio de ajuste.
- Idioma limitado al inglés según la etiqueta del modelo; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación en la generación de IR simbólica: las estructuras producidas deben validarse con un verificador externo antes de usarse.
- Dataset de ajuste no documentado: se desconoce la procedencia de los programas Python y las IR, con riesgo de sesgos y de contaminación de benchmarks.
- Sin variantes cuantizadas oficiales: el despliegue eficiente requiere conversión manual.
- Modelo con cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.
- Fecha de creación posterior a la del modelo base disponible en el ecosistema: conviene verificar la integridad del checkpoint antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dharun2049/AXIOMRIFT-3.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507

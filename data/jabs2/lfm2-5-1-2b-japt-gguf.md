# Jabs2/LFM2.5-1.2B-JAPT-GGUF

## Resumen

LFM2.5-1.2B-JAPT-GGUF es un conjunto de cuantizaciones en formato GGUF derivadas de un ajuste fino del modelo LiquidAI/LFM2.5-1.2B-Instruct, publicado por el usuario Jabs2. El ajuste convierte el modelo base en un traductor especializado de japones a portugues, pensado para el subtitulado offline de anime dentro del proyecto GoAnime TV. El modelo cuenta con 1.170.340.608 parametros (aproximadamente 1,17 mil millones) y el repositorio ocupa 0,6 GB en total.

La relevancia de esta ficha es acotada pero clara: se trata de un modelo pequeno, con licencia heredada de la familia LFM, distribuido exclusivamente en GGUF y optimizado para ejecucion local sin conexion. Su proposito no es el razonamiento general ni el codigo, sino la traduccion JA-PT de frases cortas de subtitulos, con dos cuantizaciones publicadas que priorizan el tamano reducido (567 MB y 731 MB) frente a la maxima fidelidad.

No se dispone de informacion sobre la arquitectura interna del modelo base ni sobre su ventana de contexto en la documentacion facilitada. La model card se centra en el metodo de ajuste, el protocolo de evaluacion y el uso con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de LiquidAI/LFM2.5-1.2B-Instruct; la model card no la detalla) |
| Parametros totales | 1.170.340.608 (aproximadamente 1,17 B) |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; F16 (intermedio), Q4_K_M e IQ3_M publicados; IQ3_M usa importance matrix |
| Idiomas soportados | japones y portugues (entrenamiento principal JA-PT); ingles para la direccion EN-PT |
| Licencia | no disponible en la ficha; el modelo base usa licencia lfm1.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo base LiquidAI/LFM2.5-1.2B-Instruct, por lo que no es posible detallar si se trata de un transformer clasico, un hibrido u otra variante. Lo que si se documenta es el metodo de ajuste: QLoRA con rango r=32 durante 6000 pasos sobre el modelo base Instruct.

El dataset de ajuste combina 147.000 pares japones-portugues procedentes de Tatoeba y OpenSubtitles v2024 (limpiados) con 15.000 pares ingles-portugues de Tatoeba, estos ultimos para mantener viva la direccion EN-PT. El proceso posterior consistio en fusionar los adaptadores, convertir a GGUF en F16 y cuantizar con la herramienta `llama-quantize`. La cuantizacion IQ3_M se genero con una importance matrix calibrada sobre datos de traduccion JA-PT, lo que explica que su tamano (567 MB) sea inferior al de Q4_K_M (731 MB) manteniendo la misma puntuacion en la puerta de calidad. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Traduccion de japones a portugues de frases cortas y dialogos, con foco en subtitulos de anime.
- Traduccion de ingles a portugues, preservada deliberadamente mediante el subconjunto de 15.000 pares EN-PT.
- Generacion de texto conversacional, ya que el modelo base es una variante Instruct y el repositorio incluye la etiqueta `conversational`.
- Ejecucion offline y local en formato GGUF, sin dependencia de servicios en la nube.
- Compatibilidad con endpoints (`endpoints_compatible` segun las etiquetas del repositorio).
- No hay evidencia de soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible; estas capacidades deben considerarse no disponibles.

## Casos de uso

- Subtitulado offline de anime: el modelo traduce lineas de dialogo JA-PT localmente, sin enviar contenido a servidores externos, lo que encaja con el proposito declarado del proyecto GoAnime TV.
- Preprocesado de subtitulos en lote: dado su tamano reducido (567-731 MB por cuantizacion), se puede procesar un catalogo completo de episodios en una maquina modesta ejecutando inferencia con `llama-cli` y temperatura 0 para resultados deterministas.
- Traduccion JA-PT de frases cortas: adecuado para interfaces de chat o asistentes que necesiten convertir enunciados breves entre ambos idiomas con baja huella de memoria.
- Traduccion EN-PT de apoyo: el ajuste mantiene la direccion ingles-portugues, por lo que puede usarse para normalizar subtitulos o notas en portugues a partir de fuentes en ingles.
- Despliegue en dispositivos con recursos limitados: al caber en menos de 1 GB de pesos, es viable en mini-PC, portatiles sin GPU dedicada o contenedores ligeros, algo relevante para herramientas de escritorio.
- Prototipado y evaluacion de pipelines de traduccion: sirve como modelo de referencia rapido para comparar estrategias de cuantizacion antes de escalar a modelos mayores.
- Base para nuevos ajustes QLoRA: al estar disponible el formato GGUF y documentarse el metodo de entrenamiento, puede servir de punto de partida para otras combinaciones de idiomas siguiendo el mismo procedimiento.

## Benchmarks y rendimiento

La model card no incluye benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). El unico dato publicado es una puerta de calidad de 6 frases con decodificacion greedy y temperatura 0, donde se considera PASS si se preserva el significado y no hay alucinacion.

| Cuantizacion | Tamano | Puntuacion (6 frases, temp 0) |
|---|---|---|
| LFM2.5-1.2B-JAPT-Q4_K_M.gguf | 731 MB | 5/6 |
| LFM2.5-1.2B-JAPT-IQ3_M.gguf | 567 MB | 5/6 |

Se documenta una carencia conocida: las peticiones corteses con honorifico (ejemplo citado: 先輩…いただけますか) fallan en todos los modelos pequenos probados; solo el modelo profesor de 1,8B (Hy-MT2) las resuelve correctamente.

## Requisitos de hardware

- VRAM estimada para inferencia: IQ3_M aproximadamente 0,6 GB de pesos (en torno a 1-1,5 GB con contexto y overhead); Q4_K_M aproximadamente 0,73 GB de pesos (en torno a 1,5 GB con contexto); F16 alrededor de 2,3 GB de pesos.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, cualquier GPU con 2 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4090, A100, H100) es sobradamente suficiente, aunque el modelo tambien funciona en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-quantize` aparecen explicitamente en la model card), y por compatibilidad de formato GGUF tambien Ollama, llama-cpp-python y otros runners GGUF. La etiqueta `endpoints_compatible` sugiere uso en despliegues con endpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-1.2B-JAPT (este modelo) | 1,17 B | no disponible | 5/6 en puerta de calidad JA-PT | no disponible (base lfm1.0) | GGUF en HuggingFace |
| LiquidAI/LFM2.5-1.2B-Instruct | 1,17 B | no disponible | no disponible (modelo base, no evaluado aqui) | lfm1.0 | safetensors y pesos originales |
| Hy-MT2 (profesor, 1,8B) | 1,8 B | no disponible | Resuelve el honorifico que fallan los modelos pequenos | no disponible | no disponible |

No se dispone de datos de contexto, licencia ni benchmarks comparables para los modelos alternativos mas alla de lo indicado.

## Limitaciones y advertencias

- Riesgo de alucinacion: la propia model card usa "cero alucinacion" como criterio de exito, lo que sugiere que existe riesgo de inventar contenido en la traduccion.
- Carencia conocida en peticiones corteses con honorifico japones (por ejemplo, 先輩…いただけますか), que el modelo no resuelve correctamente.
- Puerta de calidad muy reducida (6 frases) y con temperatura 0; no constituye una evaluacion robusta del rendimiento real en produccion.
- Cobertura idiomatica limitada a japones, portugues (y parcialmente ingles); no se documentan otros idiomas.
- Longitud de contexto desconocida, lo que impide garantizar su comportamiento con secuencias largas mas alla de frases de subtitulo.
- Licencia no indicada en la ficha del repositorio; el modelo base declara lfm1.0, por lo que el uso comercial debe verificarse contra los terminos de dicha licencia antes de desplegarlo.
- Trazabilidad baja: 31 descargas y 0 likes en el momento de la consulta, y ausencia de resultados de benchmarks estandar.
- El repositorio tiene un unico autor (Jabs2) sin respaldo de una organizacion verificable; conviene validar los pesos antes de usarlos en entornos criticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jabs2/LFM2.5-1.2B-JAPT-GGUF
- Modelo base: LiquidAI/LFM2.5-1.2B-Instruct (referenciado en la model card)
- Referencia al modelo profesor Hy-MT2 (1,8B), mencionado en la model card sin enlace
- Herramienta de cuantizacion e inferencia: llama.cpp (`llama-cli`, `llama-quantize`), sin enlace directo en la documentacion facilitada
- Las busquedas web realizadas no devolvieron enlaces relevantes sobre este modelo.

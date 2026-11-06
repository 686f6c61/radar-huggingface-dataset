# FenomAI/Minimax-h3_Singularity

## Resumen

Minimax-h3_Singularity es un ajuste fino (fine-tune) del modelo generativo de vídeo MiniMax-H3, publicado por FenomAI. Se distribuye como un modelo multimodal de generación de vídeo que cubre los flujos de texto-a-vídeo (T2V), imagen-a-vídeo (I2V), referencia-a-vídeo (Ref2V) y vídeo-a-vídeo (V2V), pensado para ejecutarse dentro de ComfyUI. La versión más reciente, V2 INT8, amplía la cobertura de acciones, mejora la adherencia al prompt y corrige el condicionamiento por referencia de audio respecto a la V1.

El modelo parte de una fusión de checkpoints clave del MiniMax-H3 original (`ref`, `fl` y `b25-49`) sobre la que se aplicó un ajuste fino de alto número de pasos, seguido de tres días de poda y optimización de pesos para eliminar artefactos introducidos durante el entrenamiento. El resultado busca preservar las capacidades base del modelo original (generalización y adaptabilidad de estilo) mientras mejora la calidad visual en escenas de acción, retratos en plano medio y largo, y efectos VFX.

Es relevante para equipos que ya trabajan con MiniMax-H3 en pipelines de ComfyUI y necesitan mejor calidad en movimiento dinámico, restauración facial a distancia y renderizado de estilos concretos, con un formato INT8 que reduce los requisitos de memoria frente a los pesos en precisión completa. La licencia Apache 2.0 facilita su uso comercial, aunque el modelo hereda las limitaciones del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tune de MiniMaxAI/MiniMax-H3) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (version V2 publicada en INT8) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 188,1 GB; pesos en el repositorio de Hugging Face) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base MiniMax-H3 (tipo de backbone, número de parámetros ni mecanismo de atención). Lo que sí se documenta es el proceso de ajuste: Minimax-h3_Singularity se construye mediante la fusión estratégica de los checkpoints `ref`, `fl` y `b25-49` del modelo original, sobre los que se realiza un ajuste fino de alto número de pasos. Posteriormente se dedicaron tres días a poda precisa y optimización de pesos para corregir artefactos introducidos en el entrenamiento y conservar las capacidades fundamentales del modelo base.

El ajuste se orientó a datos de vídeo de alto rango dinámico (HDR) para mejorar la claridad visual y reducir el desenfoque de movimiento en acciones rápidas. La V2 añade cobertura ampliada de escenas de acción, mayor adherencia al prompt, corrección del condicionamiento por referencia de audio (que ahora permite ajustar el tono de color del personaje) y un refuerzo del renderizado de estilos fotorealista, realismo de Asia Oriental, 3D CG y CG cinematográfico. No se especifican en la información proporcionada el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Generación de vídeo texto-a-vídeo (T2V) a partir de descripciones textuales.
- Generación de vídeo imagen-a-vídeo (I2V) partiendo de una imagen de referencia.
- Generación de vídeo referencia-a-vídeo (Ref2V) usando referencias visuales o de audio.
- Transformación vídeo-a-vídeo (V2V).
- Condicionamiento por referencia de audio para ajustar el tono de color del personaje (corregido en V2).
- Control de movimiento dinámico: secuencias complejas de esgrima, artes marciales y combate cuerpo a cuerpo.
- Generación de efectos VFX y fantasía: hechizos, auras de partículas y combate mágico.
- Captura de dinámicas faciales expresivas y matices emocionales.
- Control de cámara: paneos, inclinaciones, zooms y travellings (tracking shots).
- Renderizado de estilos fotorealista, realismo de Asia Oriental, 3D CG y CG cinematográfico.
- Restauración facial en planos medios y largos, reduciendo distorsión y colapso estructural.
- Integración con ComfyUI como entorno de ejecución.
- Soporte de prompts de hasta aproximadamente 5.000 caracteres (recomendación del autor).

## Casos de uso

- Producción de vídeo publicitario: el modelo puede generar clips fotorealistas con control de cámara (paneos, zooms, travellings) a partir de un prompt detallado, útil para prototipar anuncios antes de rodar.
- Previsualización de escenas de acción para cine o series: la cobertura ampliada de esgrima, artes marciales y combate permite generar animáticas de secuencias de lucha con movimiento fluido e impacto físico.
- Creación de contenido para redes sociales: generación I2V a partir de una imagen fija para producir clips cortos con estilos 3D CG o cinematográfico, integrable en flujos de ComfyUI.
- Efectos visuales y fantasía: generación de hechizos, auras de partículas y combate mágico para proyectos de VFX o videojuegos, aprovechando el ajuste específico en VFX.
- Restauración y mejora de metraje: el ajuste en restauración facial en planos medios y largos permite recuperar nitidez en rostros que aparecen a distancia en tomas generadas o existentes.
- Doblaje y ajuste de personajes con referencia de audio: la corrección del condicionamiento por audio en V2 permite usar una referencia sonora para ajustar el tono de color del personaje en el vídeo generado.
- Iteración de diseño de personajes: uso de Ref2V para mantener la coherencia visual de un personaje a lo largo de varias generaciones, con control de estilo explícito en el prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 188,1 GB y la versión V2 se distribuye en INT8, lo que reduce el requisito frente a precisión completa, pero no se especifica la VRAM mínima.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del repositorio y la naturaleza del modelo de vídeo sugieren requisitos elevados, pero no hay datos confirmados.
- Opciones de despliegue: ComfyUI (entorno documentado por el autor). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no aplican a un modelo de generación de vídeo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de generación de vídeo que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El modelo hereda los sesgos y limitaciones del MiniMax-H3 base, que no se detallan en la información disponible.
- Riesgo de alucinación visual: como modelo generativo de vídeo, puede producir contenido incoherente o no fiel al prompt, especialmente con instrucciones ambiguas, repetitivas o contradictorias.
- El autor recomienda mantener los prompts por debajo de aproximadamente 5.000 caracteres y evitar instrucciones excesivas o repetitivas; prompts más largos o mal estructurados pueden degradar la adherencia.
- Idiomas soportados limitados a inglés y chino (en, zh); el rendimiento en otros idiomas no está documentado.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base MiniMax-H3, del que este es un fine-tune.
- No se documentan limitaciones específicas de contexto, resolución o duración de vídeo en la información disponible.
- El modelo está pensado para ComfyUI; su integración en otros pipelines no está documentada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de validación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/FenomAI/Minimax-h3_Singularity
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Demo online (RunningHub): https://www.runninghub.ai/zh-cn/post/2112912294795993090/?inviteCode=rh-v1559
- YouTube (AIGC-Singularity): https://youtube.com/@AIGC-Singularity
- Bilibili (AIGC-Singularity): https://space.bilibili.com

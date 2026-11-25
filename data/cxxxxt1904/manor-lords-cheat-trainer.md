# CxxxxT1904/manor-lords-cheat-trainer

## Resumen

El repositorio `CxxxxT1904/manor-lords-cheat-trainer` no contiene un modelo de inteligencia artificial. Se trata de un paquete de software para Windows etiquetado como "cheat trainer" del videojuego Manor Lords, distribuido como archivo ZIP con un ejecutable (`schedule-1-cheat-trainer-v1.2.2-win64.exe`) y publicado en Hugging Face bajo la etiqueta `windows`/`x64`/`portable`. No hay pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia asociados.

La model card describe módulos de manipulación de memoria de proceso (escaneo dinámico de offsets, lectura de render por Desktop Duplication, perfiles JSON intercambiables en caliente, radar 2D) y ofrece un enlace de descarga alojado en un repositorio de GitHub de terceros, con contraseña de archivo incluida. No se documenta ninguna capacidad de generación de texto, razonamiento o procesamiento de lenguaje natural.

Por tanto, esta ficha no puede evaluar el artefacto como modelo de IA: la información disponible no permite determinar arquitectura, parámetros, contexto, cuantización ni rendimiento en tareas cognitivas. Los apartados siguientes reflejan esa ausencia de datos de forma explícita, y se advierte de los riesgos de seguridad asociados a la distribución de binarios ejecutables de este tipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos de la model card) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El artefacto es un binario nativo para Windows 10/11 de 64 bits que, según la model card, opera en modo usuario externo ("user-mode external core") sin inyección de DLL, con lectura de pantalla mediante Desktop Duplication, escaneo de firmas de punteros tras parches del juego y temporización de sondeo declarada a 260 Hz. Ninguno de estos datos corresponde a un modelo entrenado con tokens, RLHF o DPO.

La model card no proporciona información sobre dataset, número de tokens, técnica de alineación ni innovación algorítmica alguna en el sentido del aprendizaje automático. La única "build" identificada es `v2.4.4 (2D44E0)`, que corresponde a una versión de software, no a un checkpoint.

## Capacidades

- No se documenta generación de texto, razonamiento, código ni matemáticas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta capacidad de agentes ni razonamiento multi-paso.
- No se documenta procesamiento multilingüe real; los códigos de idioma de los metadatos corresponden a la descripción del paquete, no a competencia lingüística de un modelo.
- El artefacto declara funciones de modificación de memoria de un juego (presets "Legit", "Visual" y "Custom", radar 2D, filtro de loot), sin relación con capacidades cognitivas.

## Casos de uso

- No procede: el artefacto no es un modelo de IA y no puede emplearse en tareas de generación, clasificación, extracción o razonamiento.
- No es adecuado para atención al cliente, generación de código en producción, análisis documental, resumen, traducción automática ni asistentes conversacionales.
- No es adecuado para integración en pipelines de CI/CD, RAG, agentes autónomos ni evaluación de benchmarks de NLP.
- Su uso declarado es la modificación de partidas del videojuego Manor Lords en Windows, lo que puede contravenir los términos de servicio del juego y las políticas de las plataformas.
- No debe desplegarse en entornos corporativos, servidores ni infraestructura cloud: es un ejecutable de escritorio sin garantías de cadena de suministro.
- Cualquier evaluación como modelo lingüístico requeriría un artefacto distinto con pesos publicados, que aquí no existe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay métricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea de NLP. Los únicos números de la model card son latencias y parámetros de sistema del binario (por ejemplo, respuesta en menos de 27 ms o menos de 13 ms según el módulo, consumo inferior a 28 MB de RAM, 6 y 13 hilos de trabajo), que no son comparables con rendimiento de modelos.

## Requisitos de hardware

- Sistema operativo: Windows 10 u 11 de 64 bits, según la model card.
- CPU: procesadores Intel o AMD x64; no se especifican núcleos mínimos.
- RAM: la model card cita un consumo inferior a 28 MB para uno de los módulos; el total del proceso no se detalla.
- VRAM: no aplica; no hay inferencia de red neuronal.
- GPU recomendadas: no disponible; no se requiere GPU para el funcionamiento declarado.
- Despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI; el artefacto se ejecuta como binario de escritorio con privilegios de administrador.
- Latencia y throughput: no disponibles en términos de inferencia; las cifras citadas corresponden a sondeo y respuesta del programa.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no pertenece a esa categoría. Tampoco se identifican en la información proporcionada alternativas de software legítimo equivalentes.

## Limitaciones y advertencias

- No es un modelo de IA: no puede evaluarse con criterios de parámetros, contexto, cuantización o benchmarks de NLP.
- Riesgo de seguridad elevado: se distribuye un ejecutable de terceros alojado en un repositorio de GitHub ajeno al espacio de nombres del autor en Hugging Face, con contraseña de archivo incrustada, práctica habitual en campañas de distribución de malware.
- La model card reconoce explícitamente que Windows Defender y SmartScreen pueden alertar sobre el binario y recomienda desactivar o ignorar esas protecciones, lo que agrava el riesgo.
- Inconsistencia de nombres: el paquete descargable se denomina `schedule-1-cheat-trainer-v1.2.2-win64.zip` mientras el proyecto se presenta como Manor Lords, lo que sugiere reutilización de plantillas o suplantación.
- Uso de privilegios de administrador y modificación de memoria de otros procesos: superficie de ataque relevante y posible conflicto con sistemas antitrampas.
- Posible incumplimiento de los términos de servicio del videojuego y de la legislación aplicable en materia de distribución de software.
- Licencia MIT declarada, pero sin garantías sobre el contenido real del binario ni sobre su cadena de custodia.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria ni auditoría pública.
- No apto para uso comercial, producción ni entornos con datos sensibles.

## Enlaces

- Hugging Face: https://huggingface.co/CxxxxT1904/manor-lords-cheat-trainer
- Enlace de descarga citado en la model card (GitHub, terceros): https://github.com/arjunzimmermann624/schedule-1-cheat-trainer/releases/download/v1.2.0/schedule-1-cheat-trainer-v1.2.2-win64.zip
- Repositorio citado en la model card: https://github.com/cOzturk47/manor-lords-cheat-trainer/releases/latest
- Paper, blog, demo o repositorio oficial del modelo: no disponible

# Aikojsx/blox-fruits-script-portable

## Resumen

El repositorio `Aikojsx/blox-fruits-script-portable` no contiene un modelo de inteligencia artificial. Se trata de un paquete distribuible para Windows x64 que la model card presenta como un script o macro portable orientado al videojuego Blox Fruits, con módulos descritos como anti-AFK, bucle de farmeo automatizado, teletransporte por coordenadas, alertas por webhook de Discord y salto automático entre servidores. El autor publica el artefacto como un archivo ZIP de 4,8 MB protegido con contraseña que contiene un ejecutable `.exe`, y lo etiqueta en Hugging Face con la licencia MIT y una lista de idiomas que no guarda relación con ninguna capacidad lingüística de un modelo.

No hay evidencia de arquitectura de red neuronal, pesos, tokenizador, dataset de entrenamiento ni pipeline de inferencia. La ficha técnica que sigue se limita a documentar lo que el autor declara y a señalar de forma explícita los datos que no están disponibles. Cualquier evaluación como modelo de lenguaje, visión o razonamiento es imposible con la información proporcionada.

La relevancia de esta entrada es, por tanto, negativa: sirve como ejemplo de artefacto mal clasificado en un hub de modelos y como advertencia sobre la distribución de ejecutables ofuscados con contraseña a través de plataformas de pesos. No debe tratarse como un modelo open source evaluable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; se describe como ejecutable portable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del autor; sin justificación técnica) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un ZIP de 4,8 MB con un `.exe` en su interior) |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de modelo. La model card habla de un binario `fisch-script-auto-catch-macro-v1.2.2-win64.exe` con build `v1.8.5 (1756E9)`, distribuido dentro de `fisch-script-auto-catch-macro-v1.2.2-win64.zip` y protegido con la contraseña `2026`. Los módulos citados (anti-AFK por pulsos de entrada virtual, bucle de farmeo asíncrono, teletransporte por coordenadas, optimizador de frame-rate con cuatro hilos de trabajo, hopper de servidores) corresponden a técnicas de automatización de cliente de juego, no a componentes de aprendizaje automático.

No hay información sobre tokens de entrenamiento, composición del dataset, RLHF, DPO ni ninguna innovación en atención o decodificación. Los porcentajes de "consistencia" que aparecen en la tabla de capacidades (98,4 %, 96,8 %) no vienen acompañados de metodología, y no deben interpretarse como métricas reproducibles.

## Capacidades

- No se documenta ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No hay soporte declarado de tool calling ni function calling en el sentido de APIs de modelos.
- No hay soporte de agentes ni de razonamiento multi-paso.
- El multilingüismo listado en los metadatos no está respaldado por ninguna evaluación ni por artefactos de tokenización.
- Las funciones descritas por el autor son de automatización de cliente de juego: anti-AFK, farmeo, teletransporte, webhooks y cambio de servidor. No son capacidades de un modelo y su funcionamiento real no está verificado.

## Casos de uso

- No procede. El artefacto no es un modelo de IA y no se han identificado casos de uso legítimos documentados.
- Automatización de partidas en Blox Fruits: el autor la describe, pero este tipo de herramientas suele contravenir los términos de servicio del juego y conlleva riesgo de sanción de cuenta.
- Distribución de ejecutables a través de un hub de modelos: patrón que no recomendamos reproducir, ya que combina binarios ofuscados, contraseña en la propia card y enlaces de descarga externos.
- Auditoría de artefactos sospechosos: el repositorio puede usarse como caso de estudio para formación en seguridad de la cadena de suministro.
- No se identifican escenarios de integración en pipelines de datos, generación de código, atención al cliente ni análisis documental.
- No se identifican escenarios de investigación en NLP, visión o aprendizaje por refuerzo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras de "consistencia" de la model card (98,4 % y 96,8 %) carecen de definición de métrica, conjunto de evaluación y protocolo, por lo que no se recogen como benchmarks.

## Requisitos de hardware

- VRAM estimada: no aplica; no hay pesos de modelo que cargar.
- GPU recomendadas: no aplica.
- Viabilidad en GPU de consumo: no aplica.
- Plataforma declarada: Windows 10 y Windows 11 de 64 bits.
- Tamaño del paquete: 4,8 MB comprimido.
- Consumo de memoria declarado por el autor: menos de 41 MB de RAM para el módulo de cambio de servidor.
- Opciones de despliegue: ejecución directa del `.exe` como administrador, según las instrucciones del autor. No hay soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparable, porque el artefacto no es un modelo de IA. Frente a modelos ligeros reales (por ejemplo, familias de 1 a 8 mil millones de parámetros con licencia permisiva), la diferencia no es de rendimiento sino de naturaleza: aquí no hay pesos, tokenizador ni pipeline de inferencia.

## Limitaciones y advertencias

- El artefacto es un ejecutable binario distribuido con contraseña y alojado en enlaces externos; no es auditable como un modelo de pesos abiertos.
- La licencia MIT declarada en los metadatos no garantiza la legitimidad del binario ni la ausencia de código malicioso.
- El uso de scripts de automatización en Blox Fruits puede violar los términos de servicio del juego y provocar el bloqueo de la cuenta.
- La lista de idiomas y las etiquetas de Hugging Face no se corresponden con ninguna capacidad técnica verificable; se trata de metadatos engañosos para posicionamiento.
- No hay información sobre sesgos, alucinación o limitaciones de contexto porque no hay modelo; el riesgo relevante es de seguridad del software.
- No se recomienda su descarga, ejecución ni integración en entornos de producción o de investigación.

## Enlaces

- Hugging Face: https://huggingface.co/Aikojsx/blox-fruits-script-portable
- Repositorio citado en la model card: https://github.com/UyenJansen57681/blox-fruits-script-portable
- Paquete citado en la model card: https://github.com/ekaterina96522/fisch-script-auto-catch-macro/releases/download/v1.2.0/fisch-script-auto-catch-macro-v1.2.2-win64.zip
- No se han encontrado papers, blogs técnicos, demos ni repositorios de evaluación asociados.

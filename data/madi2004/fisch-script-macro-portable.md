# Madi2004/fisch-script-macro-portable

## Resumen

El artefacto publicado bajo el identificador `Madi2004/fisch-script-macro-portable` no es un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows de 64 bits, distribuido como archivo ZIP de aproximadamente 8,9 MB, que la model card describe como un script y macro para el videojuego Roblox (concretamente para el título Fisch). El repositorio de Hugging Face actúa únicamente como espejo de distribución del binario, no como alojamiento de pesos de red neuronal.

El contenido del README detalla funcionalidades propias de una herramienta de automatización de partidas: salto entre servidores de baja latencia, teletransporte por coordenadas leídas de memoria, bucles de farmeo, ESP de entidades y cofres a través de paredes, y un guardián anti-AFK. Incluye instrucciones de instalación que requieren ejecutar el binario como administrador y extraer el ZIP con la contraseña `2026`.

Desde la perspectiva de un catálogo de modelos open source, esta ficha debe leerse como una advertencia: no hay arquitectura, parámetros, contexto ni licencia de pesos que evaluar. La licencia declarada es MIT, pero se aplica al paquete de software, no a un modelo. Cualquier evaluación técnica de capacidades lingüísticas o de razonamiento es, por tanto, inaplicable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Win64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` de Windows) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es un binario compilado para Windows x64, empaquetado en `fisch-script-macro-portable-v1.2.0-win64.zip` (8,9 MB) y etiquetado internamente como build `v4.8.5 (A17F77)`. La model card menciona componentes de tiempo de ejecución como un bucle de sondeo a 469 Hz para lectura de coordenadas, 13 y 14 hilos de trabajo según el subsistema, y una frecuencia de 146 Hz para el guardián anti-AFK.

No se documenta ningún corpus de entrenamiento, ni fases de preentrenamiento, ajuste supervisado, RLHF o DPO. Tampoco se describe innovación alguna en el ámbito de modelos (atención lineal, decodificación especulativa, MoE, SSM). La única "innovación" declarada es de ingeniería de automatización de juego: telemetría de memoria del proceso y automatización de entrada.

## Capacidades

- No genera texto, código, matemáticas ni razonamiento. No es un modelo lingüístico.
- No soporta tool calling ni function calling en el sentido de la API de modelos.
- No implementa agentes de razonamiento multi-paso.
- Las capacidades multilingües declaradas en los metadatos (14 idiomas) corresponden a etiquetas del repositorio, no a competencia lingüística verificable del artefacto.
- Funcionalidades descritas en la model card, propias de un macro de juego: salto automático entre servidores, teletransporte por coordenadas, bucles de farmeo, ESP de entidades y cofres, guardián anti-AFK y configuración JSON persistente con recall de keybinds.
- No dispone de modo "thinking", visión, audio ni procesamiento multimodal en el sentido de un modelo de IA.

## Casos de uso

- Ninguno relacionado con inferencia de lenguaje natural, generación de código, atención al cliente, análisis documental o pipelines de IA. El artefacto no es adecuado para ninguna de esas tareas.
- Automatización de partidas de Roblox/Fisch: el binario se ejecutaría en un equipo Windows 11 x64 para automatizar farmeo y desplazamientos, según la descripción del autor. No es un caso de uso de IA.
- Auditoría de seguridad de artefactos en Hugging Face: el repositorio puede emplearse como caso de estudio de distribución de binarios no verificados con contraseña de extracción y ejecución como administrador.
- Análisis de ingeniería social en model cards: el README ilustra patrones de urgencia (descarga directa, contraseña, "99 % verificado") que conviene reconocer en revisiones de cadena de suministro.
- Formación en políticas de repositorios: sirve como ejemplo de por qué un hub de modelos no debería alojar ejecutables de terceros sin escaneo.
- No se identifica ningún caso de uso legítimo de despliegue en producción de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni equivalentes, porque el artefacto no es un modelo evaluable con dichos conjuntos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Requisitos reales declarados: Windows 10 u 11 de 64 bits, extracción del ZIP de 8,9 MB con contraseña `2026` y ejecución del `.exe` como administrador.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplican.
- Latencia y throughput: no disponibles; los valores de 469 Hz, 146 Hz y "< 34 ms" que aparecen en la model card son afirmaciones del autor sobre el macro, no métricas de inferencia verificadas.

## Comparativa con modelos similares

| Criterio | fisch-script-macro-portable | Modelo de lenguaje pequeño (7-8B) | Modelo MoE abierto |
|---|---|---|---|
| Naturaleza | Ejecutable Win64 (macro de juego) | Red neuronal transformer | Red neuronal MoE |
| Parámetros | no disponible (no aplica) | ~7-8 mil millones | decenas de miles de millones |
| Contexto | no disponible | 8k-128k típicamente | 32k-128k típicamente |
| Licencia | MIT (sobre el binario) | MIT/Apache-2.0 variable | variable |
| Benchmarks | ninguno | MMLU, HumanEval, GSM8K | MMLU, HumanEval, GSM8K |
| Disponibilidad | ZIP en Hugging Face y GitHub | safetensors/GGUF en hubs | safetensors/GGUF en hubs |

La comparación con modelos de IA no es significativa: no comparten categoría, formato ni finalidad. Frente a otras herramientas de automatización de Roblox, no se dispone de datos verificables de rendimiento ni de auditoría independiente.

## Limitaciones y advertencias

- No es un modelo de IA: no debe incluirse en evaluaciones de capacidades lingüísticas, de código o de razonamiento.
- Distribución de un binario ejecutable con contraseña de extracción (`2026`) y solicitud de ejecución como administrador: patrón de riesgo elevado de cadena de suministro.
- La model card reconoce explícitamente que Windows Defender y SmartScreen pueden alertar sobre el `.exe`; el autor recomienda añadirlo a la lista blanca, lo que impide la protección del sistema.
- El repositorio declara 0 descargas y 0 likes en el momento de la consulta, sin evidencia de auditoría comunitaria.
- Uso en Roblox: la automatización mediante macros y lectura de memoria puede infringir los términos de servicio de la plataforma y acarrear el bloqueo de cuentas.
- Licencia MIT declarada sobre el paquete, pero sin verificación de la procedencia del código ni de las dependencias incluidas.
- Idiomas listados en metadatos sin respaldo funcional verificable.
- No apto para producción en ningún pipeline de IA, datos o atención al cliente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Madi2004/fisch-script-macro-portable
- Repositorio GitHub referenciado en la model card: https://github.com/Volkov78996/fisch-script-macro-portable
- Releases del proyecto: https://github.com/Volkov78996/fisch-script-macro-portable/releases/latest
- Paquete directo citado por el autor: https://github.com/Volkov78996/fisch-script-macro-portable/releases/latest/download/fisch-script-macro-portable-v1.2.0-win64.zip
- Paper, blog o demo: no disponible

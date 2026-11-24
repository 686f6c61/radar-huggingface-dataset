# Borisbeets/american-truck-simulator-cheat-trainer

## Resumen

`Borisbeets/american-truck-simulator-cheat-trainer` es un repositorio alojado en Hugging Face que **no contiene un modelo de inteligencia artificial**. La model card lo describe como una utilidad ejecutable para Windows (un "trainer" o conjunto de trucos) destinada al videojuego *American Truck Simulator*, distribuida como archivo ZIP de 8,9 MB con contraseña de descompresión. El autor declara compatibilidad con Windows 10 (22H2) y Windows 11 (24H2) en arquitectura x64 y ofrece una guía de instalación basada en ejecutar un `.exe` como administrador.

El contenido técnico descrito (overlay externo, suavizado de entrada por curvas de Bézier, escáner de offsets, perfiles JSON intercambiables en caliente) corresponde a funcionalidades típicas de herramientas de trampa (*cheat*) para videojuegos, no a componentes de un modelo de lenguaje. No se declara arquitectura neuronal, número de parámetros, longitud de contexto, corpus de entrenamiento ni formato de pesos tipo safetensors o GGUF.

La relevancia de esta ficha es, por tanto, **negativa o de advertencia**: el repositorio aparece etiquetado con términos propios de IA (`license:mit`, lista amplia de idiomas, tags variados), pero su naturaleza es la de un binario de terceros para modificar un juego. No debe confundirse con un modelo open source evaluable ni ejecutarse en entornos de desarrollo sin un análisis de seguridad previo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; utilidad ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados en metadatos, sin modelo asociado) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un `.zip` de 8,9 MB con un `.exe` en su interior) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El autor describe un "user-mode external core" con renderizado vía Desktop Duplication, 15 hilos de trabajo, polling a 235 Hz, suavizado de entrada por curvas de Bézier con radio FOV configurable y un escáner dinámico de offsets con 9 hilos. Estos términos pertenecen al dominio de la instrumentación de procesos en Windows (lectura de memoria, overlays externos, resolución de firmas de punteros) y no a técnicas de aprendizaje automático.

No se documentan datos de entrenamiento, número de tokens, corpus, RLHF, DPO ni ninguna innovación de modelado. Cualquier intento de mapear estas capacidades a un pipeline de IA sería una invención y, por tanto, se declara explícitamente no disponible.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni razonamiento.
- No dispone de tool calling ni function calling en el sentido de la API de modelos.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; la lista de idiomas es metadato del repositorio.
- No incluye visión, audio ni modo "thinking".
- Funcionalmente, según la model card, se limita a operaciones sobre el proceso del juego: overlay externo con cajas 2D/3D y esqueletos, suavizado de entrada, escaneo de offsets y cambio de perfiles JSON.

## Casos de uso

- **Ninguno en el ámbito de IA**: el artefacto no puede integrarse en pipelines de inferencia, RAG, agentes ni generación de código.
- **Auditoría de repositorios sospechosos**: útil como caso de estudio de etiquetado engañoso en Hugging Face, donde tags de licencia e idiomas envuelven un binario de terceros.
- **Análisis de seguridad defensiva**: permite documentar patrones de ingeniería social (contraseña fija `2026`, enlaces a releases de GitHub de terceros, instrucciones de "Run as Administrator").
- **Formación de equipos**: ejemplo práctico de por qué no debe ejecutarse un `.exe` descargado de un repositorio de modelos sin verificación de firma.
- **Investigación de cumplimiento**: caso de estudio sobre la política de contenido de Hugging Face respecto a artefactos no relacionados con machine learning.
- **Monitorización de cadena de suministro**: ilustra la necesidad de escanear repositorios con descargas cero y metadatos inconsistentes antes de incorporarlos a un catálogo interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los únicos números citados por el autor (8,9 MB del ZIP, 235 Hz de polling, menos de 10 ms de respuesta, 15/9/11 hilos de trabajo) son parámetros operativos de la utilidad, no métricas de calidad de modelo.

## Requisitos de hardware

- **VRAM**: no aplica; no se ejecuta inferencia neuronal.
- **GPU recomendadas**: no disponibles; la model card menciona "hardware-accelerated modules" sin especificar modelos.
- **Compatibilidad consumer**: el autor declara Windows 10 (22H2) y Windows 11 (24H2) x64; no se detallan requisitos de GPU.
- **Opciones de despliegue**: no aplica vLLM, llama.cpp, Ollama ni TGI; el despliegue descrito es ejecutar un `.exe` como administrador.
- **Latencia y throughput**: el autor afirma menos de 10 ms de respuesta y polling a 235 Hz, sin metodología verificable.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable porque el artefacto no es un modelo de lenguaje, visión ni multimodal. Cualquier comparación con LLM open source sería metodológicamente inválida.

## Limitaciones y advertencias

- **No es un modelo de IA**: no debe evaluarse como tal ni incluirse en comparativas de LLM.
- **Riesgo de seguridad elevado**: distribución de un `.exe` con instrucciones de ejecución como administrador, contraseña fija y enlaces a releases de GitHub de terceros; no se ofrece verificación de firma ni hash público verificable.
- **Etiquetado engañoso**: tags de licencia MIT e idiomas múltiples sin contenido de modelo asociado; posible señuelo para posicionamiento en búsquedas.
- **Cero tracción verificable**: 0 descargas y 0 likes en el momento de la consulta, pese a que la model card presume "449K+ downloads".
- **Posible conflicto con términos de servicio del juego**: las utilidades de trampa pueden contravenir el EULA de *American Truck Simulator* y las políticas de las plataformas.
- **Licencia**: MIT declarada, pero sin texto de licencia adjunto ni archivo LICENSE verificable en la información proporcionada.
- **Sin soporte ni mantenimiento**: repositorio creado y actualizado en noviembre de 2026 según metadatos, sin historial de issues ni discusión pública.
- **No apto para producción**: no debe incorporarse a entornos corporativos, CI/CD ni sistemas de atención al cliente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Borisbeets/american-truck-simulator-cheat-trainer
- Release referenciada en la model card (terceros, no verificada): https://github.com/egorov3123/american-truck-simulator-cheat-trainer/releases/latest
- Paquete directo citado en la model card (no verificado): https://github.com/egorov3123/american-truck-simulator-cheat-trainer/releases/latest/download/american-truck-simulator-cheat-trainer-v1.2.0-win64.zip
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la información proporcionada.

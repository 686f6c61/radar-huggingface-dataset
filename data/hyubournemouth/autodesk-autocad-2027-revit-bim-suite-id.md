# hyubournemouth/autodesk-autocad-2027-revit-bim-suite-id

## Resumen

El repositorio `hyubournemouth/autodesk-autocad-2027-revit-bim-suite-id` no contiene un modelo de inteligencia artificial, sino un paquete de software de diseño asistido por ordenador (CAD) y modelado de información de construcción (BIM) para Windows x64. Se presenta como una edición portable de Autodesk AutoCAD 2027 y Revit BIM Suite, etiquetada como versión 4.5.9 y orientada a Windows 10 (22H2+) y Windows 11 (23H2/24H2). El autor de la publicación es el usuario `hyubournemouth` y el artefacto se distribuye como archivo comprimido, no como pesos de red neuronal.

El contenido de la model card describe telemetría de rendimiento gráfico (latencia p99, huella de memoria, verificación SHA-256) sobre perfiles de hardware con GPU NVIDIA, AMD e Intel, así como instrucciones de extracción con contraseña y enlaces a repositorios de GitHub y portales `github.io`. No se declara ninguna arquitectura de modelo (transformer, MoE, SSM), ni parámetros, ni longitud de contexto, ni proceso de entrenamiento. El pipeline declarado en Hugging Face es `other` y la librería es `generic`, lo que confirma que no se trata de un modelo inferible con las herramientas habituales del ecosistema (Transformers, vLLM, llama.cpp).

La relevancia de esta ficha es, por tanto, principalmente documental y de advertencia: el artefacto emplea el formato de publicación de modelos de Hugging Face para distribuir software de terceros, incluye enlaces de descarga externos con contraseña y referencias a repositorios ajenos al ecosistema de IA. Cualquier evaluador que llegue a esta página buscando un modelo de lenguaje o multimodal debe saber que no lo encontrará aquí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se describe como aplicación CAD/BIM portable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, es, pt, de, fr, tr, pl, ja, ko, id, vi, zh |
| Licencia | MIT (según metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto es un archivo `.zip` de aplicación, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

No hay información sobre arquitectura de red neuronal ni sobre entrenamiento. La model card describe un ejecutable de 64 bits para Windows con alineación de registros vectoriales AVX2, configuración JSON recargable en caliente (`config/settings.json`) y APIs gráficas DirectX 12 y Vulkan 1.3. Los datos de "benchmark" que se presentan son mediciones de latencia de frame pacing (p99 entre 1,42 ms y 2,15 ms) y huella de memoria (entre 42,4 MB y 45,2 MB de RAM) sobre configuraciones de hardware concretas (RTX 4070, RTX 3060, RX 7800 XT, Arc A770). No se documenta ningún corpus de entrenamiento, ni fases de RLHF/DPO, ni innovaciones de inferencia como decodificación especulativa o atención lineal.

## Capacidades

- No se declara ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- Las capacidades multilingües listadas (12 idiomas) corresponden a la localización del paquete de software, no a capacidades lingüísticas de un modelo.
- El artefacto se presenta como suite CAD/BIM con APIs gráficas DirectX 12 y Vulkan, lo que es una capacidad de aplicación de escritorio, no de modelo.

## Casos de uso

- No disponible. Al no tratarse de un modelo de IA, no procede enumerar casos de uso de inferencia (generación de texto, atención al cliente, generación de código, RAG, agentes, etc.).
- El único uso coherente con el contenido descrito sería la instalación del paquete CAD/BIM en un equipo Windows x64, extremo que excede el alcance de esta ficha y que además requiere verificación de procedencia y licencia del software original de Autodesk.
- Cualquier evaluador que busque un modelo para procesamiento de lenguaje natural debe descartar este repositorio y acudir a otra fuente.

## Benchmarks y rendimiento

La model card incluye una matriz de telemetría de runtime, pero no son benchmarks de modelo de IA. Se reproduce a título informativo, tal como aparece en la información proporcionada:

| Perfil de hardware | API / runtime | Latencia p99 | Huella de memoria | Verificación |
|---|---|---|---|---|
| NVIDIA RTX 4070 / Ryzen 7 7800X3D (Win 11 24H2 x64) | DX12 / Vulkan 1.3 | 1,42 ms (+48% 1% low FPS) | 44,8 MB RAM | PASS (SHA-256) |
| NVIDIA RTX 3060 / Core i5-13600K (Win 11 23H2 x64) | DX12 / AVX2 | 1,89 ms (+41% 1% low FPS) | 42,4 MB RAM | PASS (SHA-256) |
| AMD RX 7800 XT / Ryzen 5 7600X (Win 10 22H2 x64) | Vulkan / Async Compute | 1,65 ms (+44% 1% low FPS) | 43,1 MB RAM | PASS (SHA-256) |
| Intel Arc A770 / Core i7-12700K (Win 11 24H2 x64) | XeSS / DX12 SwapChain | 2,15 ms (+37% 1% low FPS) | 45,2 MB RAM | PASS (SHA-256) |

No se han publicado resultados de benchmarks de modelo (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo de IA).
- GPU recomendadas: la model card cita perfiles con RTX 4070, RTX 3060, RX 7800 XT y Arc A770 como entornos de prueba del paquete CAD/BIM.
- Compatibilidad con GPU de consumo: según la información proporcionada, el paquete se ha probado en GPU de consumo de gama media y alta; no se especifican requisitos mínimos oficiales.
- Opciones de despliegue: no aplica (no es compatible con vLLM, llama.cpp, Ollama ni TGI; se distribuye como `.zip` para Windows x64).
- Latencia y throughput: los únicos datos son los de frame pacing de la tabla anterior (p99 entre 1,42 ms y 2,15 ms); no hay datos de throughput de inferencia.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos similares" porque el artefacto no es un modelo de IA. Una comparación con modelos de lenguaje o multimodales sería metodológicamente incorrecta.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no debe citarse como modelo en revisiones, comparativas ni pipelines de evaluación de IA.
- La model card incluye enlaces de descarga externos (GitHub Releases) con contraseña de extracción (`2026`), práctica habitual en distribuciones no oficiales de software y que exige verificación independiente de procedencia e integridad.
- Se referencian repositorios de GitHub y portales `github.io` de terceros, así como un artefacto denominado `dlssg-to-xefg-universal-wrapper`, ajeno al nombre del repositorio; esta discrepancia es una señal de riesgo que conviene investigar antes de ejecutar cualquier binario.
- El software descrito (AutoCAD, Revit) es propiedad de Autodesk y se distribuye comercialmente bajo sus propias licencias; la licencia MIT declarada en el repositorio de Hugging Face no puede otorgar derechos sobre software de terceros.
- No se aporta información sobre sesgos, alucinación, límites de contexto o idioma, porque no son aplicables a un paquete de software.
- No se han verificado los binarios ni las afirmaciones de rendimiento de la model card; se recomienda precaución y análisis en entorno aislado si se decide inspeccionar el artefacto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hyubournemouth/autodesk-autocad-2027-revit-bim-suite-id
- Repositorio GitHub citado (principal): https://github.com/tomasz5646/autodesk-autocad-2027-revit-bim-suite-id
- Portal `github.io` citado: https://tomasz5646.github.io/autodesk-autocad-2027-revit-bim-suite-id/
- Documentación Go citada: https://pkg.go.dev/github.com/tomasz5646/autodesk-autocad-2027-revit-bim-suite-id
- Notebook de verificación citado: https://nbviewer.org/github/tomasz5646/autodesk-autocad-2027-revit-bim-suite-id/blob/main/notebooks/quickstart.ipynb
- Archivo de release citado: https://github.com/Bianchi61/dlssg-to-xefg-universal-wrapper/releases/download/v3.2.2/dlssg-to-xefg-universal-wrapper-v3.2.2-win64.zip

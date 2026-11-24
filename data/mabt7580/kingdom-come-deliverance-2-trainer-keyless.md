# Mabt7580/kingdom-come-deliverance-2-trainer-keyless

## Resumen

El repositorio `Mabt7580/kingdom-come-deliverance-2-trainer-keyless` no contiene un modelo de inteligencia artificial. Se trata de un paquete alojado en Hugging Face que, segun su propia model card, distribuye un ejecutable para Windows x64 (`monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.exe`, build `v3.2.7`) empaquetado en un archivo ZIP de 4,8 MB protegido con contrasena. El contenido se presenta como un "trainer" (herramienta de trampas) para el videojuego *Kingdom Come: Deliverance 2*, con funciones descritas de overlay externo, ESP, radar 2D y escaneo dinamico de offsets de memoria.

La ficha se ha redactado siguiendo la estructura habitual de modelos, pero debe quedar claro desde el principio que no existe arquitectura neuronal, pesos, tokenizador ni pipeline de inferencia asociados. Los campos tecnicos propios de un modelo de lenguaje se marcan como "no disponible" porque no aplican. El repositorio emplea la etiqueta `license: mit` y declara soporte para catorce idiomas, aunque esa declaracion se refiere a la documentacion del paquete, no a capacidades linguisticas de un modelo.

Desde el punto de vista de evaluacion tecnica, el artefacto es relevante unicamente como ejemplo de riesgo en la cadena de suministro de software: un binario opaco, alojado en una plataforma de modelos, distribuido mediante enlaces a repositorios de GitHub de terceros y protegido con contrasena para dificultar el analisis automatizado. No debe tratarse como un modelo open source ni ejecutarse en entornos de desarrollo o investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable PE para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados en metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP de 4,8 MB con un `.exe`) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento. La model card describe un "user-mode external core" que, segun el autor, evita inyeccion de DLL en el proceso del juego y utiliza Desktop Duplication para renderizar un overlay externo. Tambien menciona un "dynamic offset scanner" para resolver firmas de punteros tras actualizaciones del juego, perfiles JSON intercambiables en caliente y doce hilos de trabajo. Ninguna de estas afirmaciones es verificable a partir de la informacion disponible, y no se aportan detalles sobre el binario, sus dependencias ni su cadena de compilacion.

El paquete se distribuye desde un repositorio de GitHub (`martina1713/monster-hunter-wilds-trainer-mod-2026`) cuyo nombre no coincide con el del repositorio de Hugging Face ni con el del juego al que dice dirigirse, lo que constituye una senal de alarma adicional. La contrasena del archivo (`2026`) se publica en la propia model card, de modo que la proteccion no aporta seguridad real, solo dificulta el escaneo automatico.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve problemas matematicos.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues en el sentido de un modelo; los idiomas listados son metadatos del repositorio.
- No dispone de modo "thinking", vision, audio ni ninguna modalidad de inferencia.
- El binario declara funciones de overlay externo, ESP con cajas 2D/3D y esqueletos, radar 2D, filtro de loot y perfiles JSON, todas ellas orientadas a modificar la experiencia de un videojuego.

## Casos de uso

- Ninguno recomendado en el contexto de desarrollo de software, investigacion en IA o despliegue en produccion.
- Auditoria de seguridad: analizar el binario en una maquina virtual aislada y sin red para documentar su comportamiento, como ejercicio de analisis de malware.
- Formacion en concienciacion sobre cadena de suministro: usar el repositorio como caso de estudio de paquetes opacos alojados en plataformas de modelos.
- Investigacion sobre abuso de plataformas: estudiar como se reutilizan etiquetas y metadatos de Hugging Face para dar apariencia de legitimidad a artefactos ajenos al ecosistema.
- No se identifican casos de uso legitimos adicionales a partir de la informacion disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona cifras como `98,3 %` de consistencia o `< 11 ms` de respuesta, pero no se acompanan de metodologia, entorno de prueba ni datos reproducibles, por lo que no deben considerarse mediciones validas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, no hay inferencia neuronal.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows x64 (Windows 11 en las etiquetas), con ejecucion como administrador.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna, no es un modelo.
- Latencia y throughput: no disponibles; las cifras del autor no son verificables.

## Comparativa con modelos similares

| Criterio | Este repositorio | Modelo de lenguaje open source tipico (p. ej. familia Llama, Qwen, Mistral) | Modelo de vision-lenguaje open source tipico |
|---|---|---|---|
| Naturaleza del artefacto | Ejecutable Windows en ZIP | Pesos en safetensors/GGUF | Pesos en safetensors |
| Parametros | no disponible | Cientos de millones a decenas de miles de millones | Similar |
| Contexto | no disponible | 8k a 128k tokens segun variante | Similar |
| Licencia | MIT (metadatos) | Licencias permisivas o comunitarias | Variable |
| Reproducibilidad | Nula (binario opaco) | Alta (pesos y receta publicados) | Alta |
| Uso recomendado | Ninguno | Desarrollo, investigacion, produccion | Desarrollo, investigacion, produccion |

No se identifican alternativas comparables dentro de la categoria de modelos de IA porque el artefacto no pertenece a esa categoria.

## Limitaciones y advertencias

- No es un modelo de IA: carece de pesos, arquitectura y pipeline; cualquier expectativa de inferencia es erronea.
- Binario opaco distribuido con contrasena conocida, lo que impide inspeccion automatica y favorece la ocultacion de contenido.
- Discrepancia entre el nombre del repositorio de Hugging Face, el del repositorio de GitHub y el del juego objetivo, senal clasica de paquete no confiable.
- Riesgo elevado de malware, adware o robo de credenciales; la ejecucion como administrador agrava el impacto potencial.
- Posible violacion de los terminos de servicio del videojuego y de las condiciones de uso de la plataforma de alojamiento.
- La licencia MIT declarada en los metadatos no garantiza la legalidad ni la seguridad del contenido distribuido.
- No apto para produccion, investigacion ni entornos corporativos bajo ninguna circunstancia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Mabt7580/kingdom-come-deliverance-2-trainer-keyless
- Repositorio de GitHub referenciado en la model card: https://github.com/martina1713/monster-hunter-wilds-trainer-mod-2026
- Repositorio de GitHub alternativo referenciado: https://github.com/Ricardof68435/kingdom-come-deliverance-2-trainer-keyless
- Enlace de descarga del ZIP citado en la model card: https://github.com/martina1713/monster-hunter-wilds-trainer-mod-2026/releases/download/v1.2.0/monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.zip
- Resultado de busqueda web sin relacion con el artefacto: https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools

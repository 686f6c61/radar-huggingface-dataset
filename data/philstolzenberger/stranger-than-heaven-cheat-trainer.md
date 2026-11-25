# Philstolzenberger/stranger-than-heaven-cheat-trainer

## Resumen

El repositorio `Philstolzenberger/stranger-than-heaven-cheat-trainer` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de una publicacion que, bajo la apariencia de una model card, distribuye un supuesto "cheat trainer" (herramienta de trampas) para el videojuego *Stranger Than Heaven*, empaquetado como un ejecutable de Windows de 64 bits (`kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.exe`) dentro de un archivo ZIP de 4,8 MB protegido con contrasena.

Los metadatos de Hugging Face (tags `windows`, `windows-11`, `x64`, `portable`) y la estructura del README (badges de descargas y valoracion, enlaces a binarios alojados en GitHub Releases de terceros, contrasena de descompresion) son caracteristicos de campanas de distribucion de software potencialmente malicioso o no verificado, no de un artefacto de aprendizaje automatico. No existe pipeline declarado, ni pesos, ni configuracion de transformer, ni tokenizador.

Desde la perspectiva de evaluacion de modelos, esta ficha no puede aportar especificaciones tecnicas de IA porque no las hay. El contenido es relevante unicamente como caso de estudio de abuso de plataformas de modelos abiertos para alojar y promocionar binarios ejecutables ajenos al ecosistema. Cualquier descarga o ejecucion del binario referenciado queda fuera del alcance de esta ficha y conlleva riesgos de seguridad no evaluados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados en metadatos, sin modelo linguistico asociado) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene arquitectura de red neuronal, datos de entrenamiento, proceso de RLHF/DPO ni innovacion tecnica alguna en el ambito del aprendizaje automatico. El "artefacto" descrito es un ejecutable portable de Windows con modulos que el autor denomina "dynamic offset scanner", "2D radar & loot filter", "user-mode external core", "stream-proof render layer" y "external overlay", presentados como componentes de una herramienta de trampas para un videojuego.

No se dispone de informacion sobre el origen del binario, el proceso de compilacion, las dependencias ni el codigo fuente, pese a la licencia MIT declarada. La ausencia de repositorio de codigo verificable y la presencia de una contrasena fija (`2026`) para el archivo ZIP son indicios de un empaquetado opaco.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no programa ni resuelve matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues reales; los idiomas listados son metadatos de la model card.
- El binario declara funcionalidades de trampas para videojuegos (radar 2D, filtro de loot, overlay externo, ESP con cajas delimitadoras y esqueletos, tecla de panico `END`), sin verificacion independiente.

## Casos de uso

No se identifican casos de uso legitimos en el ambito de IA, desarrollo o investigacion. Los unicos escenarios plausibles son de analisis de seguridad, no de aplicacion productiva:

- Analisis de campanas de abuso de Hugging Face: estudiar como se estructuran model cards fraudulentas que imitan repositorios legitimos para distribuir binarios.
- Formacion en seguridad: usar el ejemplo como caso practico de ingenieria social (badges de descargas, valoraciones, contrasenas) en talleres de concienciacion.
- Investigacion sobre cadena de suministro de software: documentar patrones de enlaces a GitHub Releases de terceros y nombres de archivo inconsistentes con el proyecto.
- Monitorizacion de plataformas: alimentar clasificadores que detecten repositorios sin pesos ni pipeline declarado pero con ejecutables.
- Auditoria de licencias: revisar la coherencia entre licencia MIT declarada y ausencia de codigo fuente publico.
- Respuesta a incidentes: catalogar indicadores de compromiso (hashes, URLs, contrasenas) si el binario se identifica como malicioso.

En ningun caso se recomienda descargar ni ejecutar el artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni ninguna otra metrica de modelos de lenguaje, porque no contiene un modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles.
- Requisitos del artefacto: sistema Windows 10/11 de 64 bits, descompresion con 7-Zip o WinRAR y contrasena `2026`, ejecucion como administrador segun el README. Consumo de RAM declarado por el autor: menos de 65 MB y menos de 62 MB en dos modulos.

## Comparativa con modelos similares

No disponible. No existe categoria de modelos comparable porque el repositorio no contiene un modelo de IA. Frente a repositorios legitimos de modelos abiertos (que publican pesos en safetensors o GGUF, configuracion, tokenizador y evaluaciones), este artefacto carece de todos esos elementos.

| Criterio | Este repositorio | Repositorio tipico de modelo abierto |
|---|---|---|
| Pesos publicados | No | Si (safetensors/GGUF) |
| Configuracion y tokenizador | No | Si |
| Pipeline declarado | No | Si |
| Evaluaciones publicadas | No | Habitualmente |
| Codigo fuente verificable | No | Si |
| Contenido | Ejecutable `.exe` en ZIP | Artefactos de modelo |

## Limitaciones y advertencias

- No es un modelo de IA: no debe citarse ni evaluarse como tal en comparativas de modelos.
- Riesgo de seguridad elevado: el contenido principal es un ejecutable de Windows distribuido mediante enlaces externos y contrasena fija, sin trazabilidad ni firma verificable.
- Posible phishing o malware: los patrones (badges de descargas infladas, valoracion inventada, enlaces a repositorios de terceros) coinciden con campanas de distribucion de software no deseado.
- Incoherencia de nombres: el ZIP y el ejecutable hacen referencia a *Kingdom Come: Deliverance 2* mientras el titulo del repositorio menciona *Stranger Than Heaven*, lo que sugiere reutilizacion de plantillas entre campanas.
- Licencia MIT declarada sin codigo fuente: la licencia no es aplicable de forma verificable al no publicarse el codigo.
- Idiomas declarados sin respaldo: los 14 idiomas listados son metadatos, no capacidades reales.
- Uso comercial: sin sentido en el contexto de IA; en el contexto del binario, su uso puede infringir los terminos de servicio del videojuego y la legislacion aplicable.
- Recomendacion: no descargar, no ejecutar y reportar el repositorio a Hugging Face.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Philstolzenberger/stranger-than-heaven-cheat-trainer
- Enlace de descarga citado en la model card (GitHub Releases de terceros): https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026/releases/download/v1.2.0/kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip
- Repositorio GitHub de terceros citado: https://github.com/mishra82819/stranger-than-heaven-cheat-trainer/releases/latest
- Paper, blog o demo oficial: no disponible

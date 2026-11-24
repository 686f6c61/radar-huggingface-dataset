# Madi2004/dubai-rp-script-free

## Resumen

`Madi2004/dubai-rp-script-free` es un repositorio alojado en Hugging Face que **no contiene un modelo de inteligencia artificial**. Se trata de un paquete de software ejecutable para Windows x64 distribuido como archivo ZIP (`dubai-rp-script-free-v1.2.0-win64.zip`, 8,9 MB) que, segun su propia model card, implementa funcionalidades propias de un *cheat* o *script* para un juego de rol multijugador (presuntamente "Dubai RP"). El contenido descrito incluye radar 2D por lectura directa de memoria, filtro de loot por rareza, capa de renderizado "stream-proof" para evadir capturas de OBS/ShadowPlay/Discord, suavizado de entrada Bezier con VisCheck y un escáner dinámico de offsets.

El repositorio no expone pesos, arquitectura de red neuronal, tokenizador ni pipeline de inferencia. Los metadatos de Hugging Face (tags `windows`, `windows-11`, `x64`, `portable`) y la ausencia de campo `pipeline` confirman que no es un modelo al uso, sino un binario empaquetado. Por tanto, esta ficha documenta lo que el artefacto declara ser y advierte de los riesgos asociados, sin poder aportar especificaciones de modelo porque no existen.

La relevancia de documentarlo es precisamente la de señalar un caso de uso indebido de la plataforma Hugging Face: un binario cerrado de dudosa procedencia, sin trazabilidad de build, distribuido con contraseña de descompresión y alojado bajo una licencia MIT que no cubre el contenido real. No debe confundirse con un modelo de lenguaje ni evaluarse como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario PE x64 para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados en metadatos; sin funcionalidad linguistica verificable) |
| Licencia | MIT (declarada en metadatos; cobertura legal del binario cuestionable) |
| Formato de pesos | no disponible (se distribuye un ZIP con un `.exe`, no pesos) |

## Arquitectura y entrenamiento

No aplica. El artefacto no es una red neuronal ni un modelo entrenado. Segun la model card, el paquete contiene un ejecutable `dubai-rp-script-free-v1.2.0-win64.exe` (build declarado `v1.5.2`, hash parcial `A6FE19F8D6`) que opera en modo usuario externo sobre Windows x64, sin inyeccion de DLL, usando Desktop Duplication para el renderizado. Declara 12 hilos de trabajo y un consumo de RAM inferior a 46 MB, con tiempos de respuesta por debajo de 25 ms.

No existe información sobre datos de entrenamiento, dataset, RLHF, DPO ni proceso de ajuste, porque no hay modelo. Las "funcionalidades" descritas (radar por memoria, filtro de loot, evasión de captura de pantalla, panic key) son propias de software de trampas para videojuegos, no de un sistema de IA.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni visión.
- No soporta *tool calling* ni *function calling*.
- No implementa razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües reales pese a los 14 idiomas listados en metadatos.
- Funcionalidades declaradas por el autor (no verificadas): radar 2D por lectura directa de memoria, filtro de loot por rareza, capa de renderizado excluida de OBS/ShadowPlay/Discord, panic key `END`, suavizado Bezier con radio de FOV configurable, escáner dinámico de offsets.

## Casos de uso

- **No recomendado para ningún caso de uso legítimo.** El artefacto es un binario cerrado sin código fuente auditable, distribuido con contraseña de descompresión (`2026`) y alojado en un repositorio de terceros no verificado.
- **Análisis de malware (entornos aislados):** investigadores de seguridad podrían analizar el binario en una máquina virtual sin red para caracterizar su comportamiento, dado que la model card recomienda desactivar advertencias de SmartScreen y ejecutar como administrador.
- **Estudio de abuso de plataforma:** documentar cómo se emplean repositorios de Hugging Face para distribuir ejecutables ajenos a la IA, con el fin de diseñar políticas de moderación.
- **Formación en ciberseguridad:** usar el caso como ejemplo de ingeniería social (badges falsos de descargas, contraseña en el README, instrucciones de "whitelist" en Defender).
- **Auditoría de licencias:** revisar la incoherencia entre la licencia MIT declarada y la naturaleza del contenido distribuido.
- **Monitorización de repositorios:** incluir el ID en listas de bloqueo de organizaciones que filtran artefactos no-modelo en sus espejos internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto no es evaluable con MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware

- **VRAM:** no aplica (no hay inferencia de modelo).
- **GPU:** no aplica; el autor declara uso de Desktop Duplication, que puede ejecutarse con GPU integrada.
- **CPU/RAM:** Windows x64; el autor declara menos de 46 MB de RAM y 12 hilos de trabajo.
- **Almacenamiento:** 8,9 MB para el ZIP; espacio adicional tras descomprimir no especificado.
- **Despliegue:** no aplica vLLM, llama.cpp, Ollama ni TGI. Se distribuye como ejecutable `.exe` que el autor indica ejecutar "como administrador".
- **Latencia/throughput:** el autor declara menos de 25 ms de respuesta; no verificable.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable: el artefacto no es un modelo de IA. Frente a modelos open source reales (por ejemplo, familias Llama, Mistral o Qwen) la comparación es inválida por diferencia de naturaleza.

## Limitaciones y advertencias

- **No es un modelo de IA:** no debe evaluarse, desplegarse ni citarse como tal.
- **Riesgo de seguridad alto:** binario cerrado, sin código fuente, con contraseña de descompresión y recomendación explícita de ejecutar como administrador y desactivar avisos de Defender/SmartScreen.
- **Procedencia no verificable:** el repositorio de GitHub enlazado (`VictoriaKarlsson3360/...`) no está validado; el binario podría contener código malicioso.
- **Uso ilícito potencial:** las funcionalidades descritas (evasión de captura, lectura de memoria de otro proceso) pueden violar los términos de servicio del juego objetivo y la legislación aplicable en materia de trampas y protección de software.
- **Licencia incoherente:** la licencia MIT declarada no aclara la titularidad del binario ni cubre responsabilidades derivadas de su ejecución.
- **Sin soporte ni mantenimiento:** 0 descargas, 0 likes, sin issues ni documentación técnica verificable.
- **Idiomas declarados sin respaldo:** los 14 idiomas de los metadatos no corresponden a ninguna capacidad lingüística implementada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Madi2004/dubai-rp-script-free
- Repositorio GitHub enlazado por el autor: https://github.com/VictoriaKarlsson3360/dubai-rp-script-free
- Releases del autor: https://github.com/VictoriaKarlsson3360/dubai-rp-script-free/releases/latest
- Descarga directa declarada (no recomendada): https://github.com/VictoriaKarlsson3360/dubai-rp-script-free/releases/latest/download/dubai-rp-script-free-v1.2.0-win64.zip

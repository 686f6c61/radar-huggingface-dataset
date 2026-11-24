# F7lfivem/bitget-futures-copytrade-grid-bot

## Resumen

`F7lfivem/bitget-futures-copytrade-grid-bot` es un repositorio alojado en Hugging Face que **no contiene un modelo de inteligencia artificial**. Se trata de un paquete distribuible para Windows x64 presentado como bot de trading de futuros y copytrade para el exchange Bitget, empaquetado como un archivo ZIP de 4,8 MB protegido con contraseña y un ejecutable (`schedule-1-cheat-trainer-v1.2.2-win64.exe`). El autor de la model card es `F7lfivem`, aunque el contenido interno hace referencia a repositorios de GitHub de terceros (`Isabela3497`, `arjunzimmermann624`) sin relación verificable con el titular de la ficha.

La ficha carece de cualquier artefacto propio de un modelo: no hay pesos, tokenizador, configuración de arquitectura, pipeline declarado ni tarjeta técnica con parámetros. Los tags de Hugging Face (`windows`, `portable`, `x64`) y la estructura del README (instrucciones de descarga, contraseña de descompresión, ejecución como administrador) son propios de una **página de distribución de software**, no de un modelo de lenguaje. El contenido mezcla terminología de trading de criptomonedas (grid, copytrade, MEV, bundles de Jito) con referencias a un supuesto "cheat trainer" para el videojuego *Schedule 1*, lo que indica una plantilla reutilizada de forma incoherente.

Por tanto, esta ficha documenta un artefacto **no evaluable como modelo de IA**. Se describe lo que el repositorio declara y se advierte de los riesgos de seguridad asociados a la ejecución de binarios opacos distribuidos con contraseña y alojados en cuentas sin historial. No se debe interpretar ninguna sección de esta ficha como validación técnica del software.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto de software para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados en metadatos; no verificables) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`; no hay safetensors, GGUF ni similares) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El repositorio contiene un paquete comprimido (`schedule-1-cheat-trainer-v1.2.2-win64.zip`, 4,8 MB) con un ejecutable para Windows x64, presentado como build `v1.5.1 (251444)`. La model card menciona módulos internos —"20-wallet LUT bundler", "local AES-256 key vault", "Jito & MEV bundle engine", "multi-tier take profit", "paper-trade sandbox", "smart-money copytrade"— y cifras de hilos de trabajo (7, 9, 10, 14, 15 workers) y consumo de RAM (<27 MB). Estos datos son afirmaciones del autor sin respaldo técnico verificable: no se aportan repositorios de código fuente, papers, logs de build ni artefactos de compilación reproducibles.

La única innovación declarada de interés técnico es el uso de "Lookup Tables" para ejecución multi-wallet en el mismo bloque y un motor de bundles con dimensionado dinámico de propinas, terminología propia del ecosistema Solana (Jito, MEV, LUT). Sin embargo, el título del repositorio hace referencia a futuros de Bitget, un exchange centralizado, lo que resulta contradictorio con esa terminología. No hay información sobre datasets, RLHF, DPO ni ningún proceso de aprendizaje automático.

## Capacidades

- No es un modelo generativo: no produce texto, código, razonamiento ni matemáticas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso basado en IA.
- El multilingüismo declarado (14 idiomas) corresponde a los metadatos de la model card, no a capacidades lingüísticas de un modelo.
- Funcionalidad declarada (no verificada): ejecución de órdenes en futuros de Bitget, replicación de carteras ("copytrade"), estrategias de grid, simulación en sandbox, gestión de claves locales AES-256 y motor de bundles MEV.
- No dispone de modo "thinking", visión, audio ni ninguna capacidad multimodal.

## Casos de uso

Ninguno de los siguientes casos constituye una recomendación de uso; se listan como escenarios que el autor declara, con la advertencia de que no son verificables y de que el binario no debe ejecutarse sin auditoría previa.

- Trading automatizado en futuros de Bitget: el autor afirma que el ejecutable permite lanzar estrategias de grid sobre contratos perpetuos; no hay evidencia de que funcione ni de que sea seguro.
- Copytrade de carteras: se declara replicación de posiciones de "smart money" con dimensionado proporcional; sin acceso al código fuente no puede validarse.
- Simulación en sandbox: se menciona un modo de paper trading contra libros de órdenes en vivo con consumo declarado inferior a 27 MB de RAM.
- Gestión de claves: se anuncia una bóveda local AES-256 con firma no custodial; introducir claves privadas en un binario opaco es un riesgo crítico.
- Ejecución de bundles MEV: se declara inclusión atómica en bloque con propinas dinámicas, terminología de Solana que no encaja con Bitget.
- Distribución multiplataforma: el paquete solo apunta a Windows x64; no hay builds para Linux, macOS ni ARM.
- Formación o demostración: el artefacto puede servir como ejemplo de mala práctica en publicación de software en Hugging Face (binarios con contraseña, enlaces a repositorios de terceros, ausencia de código fuente).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de rendimiento, latencia, throughput ni evaluaciones comparativas. Las cifras de "99% Verified", "107K+ downloads" y "Rating" que aparecen en la model card son insignias decorativas (badges) sin fuente verificable y no deben interpretarse como datos de rendimiento.

## Requisitos de hardware

- Plataforma objetivo: Windows x64 (Windows 11 mencionado en los tags).
- VRAM: no aplica; no hay modelo de IA que cargar en GPU.
- GPU recomendadas: no aplicable.
- Cabe en cualquier equipo consumer con Windows x64 según los requisitos declarados; el autor afirma un consumo de RAM inferior a 27 MB, cifra no verificada.
- Opciones de despliegue: ejecución directa del binario `.exe` como administrador; no hay soporte para vLLM, llama.cpp, Ollama ni TGI porque no existe modelo.
- Latencia y throughput: no disponibles; las menciones a "low-latency" y "high-frequency" son afirmaciones del autor sin mediciones.

## Comparativa con modelos similares

No procede comparación con modelos de IA. Como referencia de la categoría de artefactos, se contrasta con lo que sería un repositorio legítimo de un modelo open source:

| Criterio | Este repositorio | Modelo open source típico (p. ej. Llama, Qwen, Mistral) |
|---|---|---|
| Contenido | ZIP con `.exe` y contraseña | Pesos en safetensors/GGUF + tokenizador + config |
| Código fuente | No incluido | Repositorio público y reproducible |
| Licencia | MIT declarada, sin fichero LICENSE verificable | LICENSE explícita y compatible |
| Pipeline en HF | no disponible | text-generation, image-text-to-text, etc. |
| Trazabilidad del autor | Cuenta sin historial; enlaces a terceros | Organización verificada con historial |
| Evaluación posible | Ninguna | Benchmarks publicados y reproducibles |

## Limitaciones y advertencias

- **No es un modelo de IA**: no debe tratarse como tal en pipelines, evaluaciones ni comparativas de modelos.
- **Riesgo de seguridad alto**: se distribuye un binario opaco protegido con contraseña (`2026`) que se solicita ejecutar como administrador; esto es un patrón habitual en campañas de malware y no permite inspección previa.
- **Enlaces a repositorios de terceros**: la model card apunta a cuentas de GitHub (`arjunzimmermann624`, `Isabela3497`) sin relación verificable con el autor de la ficha; posible suplantación o redirección maliciosa.
- **Incoherencia interna**: se mezcla un supuesto "cheat trainer" para el juego *Schedule 1* con un bot de trading de Bitget y terminología de Solana (Jito, MEV, LUT); señal de plantilla reciclada.
- **Riesgo financiero**: cualquier uso con claves de API o fondos reales de un exchange puede derivar en pérdida total; no hay auditoría, código fuente ni garantías.
- **Licencia**: la MIT declarada en metadatos no está respaldada por un fichero `LICENSE` en el repositorio; la situación legal del binario es incierta.
- **Sin soporte ni mantenimiento**: 0 descargas, 0 likes, creado y actualizado el mismo día (2026-11-24); no hay issues, discusiones ni historial.
- **Idiomas**: los 14 idiomas listados son metadatos, no capacidades verificadas.
- **Recomendación**: no descargar ni ejecutar el artefacto; si se necesita un bot de trading, optar por software con código fuente auditable y claves gestionadas fuera del binario.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/F7lfivem/bitget-futures-copytrade-grid-bot
- Repositorio de GitHub referenciado en la model card (no verificado): https://github.com/Isabela3497/bitget-futures-copytrade-grid-bot
- Repositorio de GitHub referenciado para la release (no verificado): https://github.com/arjunzimmermann624/schedule-1-cheat-trainer
- Paper, blog, demo o documentación técnica: no disponible

# alfandaxdrake14/trust-wallet-metamask-seed-recovery-pc

## Resumen

No existe ningún modelo de IA en el repositorio `alfandaxdrake14/trust-wallet-metamask-seed-recovery-pc`. Se trata de un repositorio de Hugging Face cuyo nombre y contenido suplantan la identidad de una supuesta herramienta de "recuperación de seed" para Trust Wallet y MetaMask, pero que en realidad distribuye un ejecutable de Windows (`elden-ring-nightreign-trainer-coop-2026-v1.2.2-win64.exe`) empaquetado en un ZIP protegido con contraseña y alojado en un repositorio de GitHub de terceros. No hay pesos, no hay arquitectura, no hay tokenizador ni pipeline: los tags (`windows`, `x64`, `portable`) describen un binario, no un modelo.

El texto de la model card mezcla de forma deliberada terminología de modelos (tags de idioma, licencia MIT) con instrucciones para descargar y ejecutar un binario como administrador. Es un patrón clásico de distribución de *malware* disfrazado de herramienta de criptomonedas: el nombre promete recuperar frases semilla (lo que en la práctica solo puede hacerse mediante fuerza bruta sobre billeteras ajenas o mediante robo de credenciales), y el "paquete" real es un ejecutable sin firma ni trazabilidad.

Desde el punto de vista técnico, esta ficha no puede documentar un modelo porque no lo hay. Lo que se documenta a continuación es la naturaleza del artefacto, sus riesgos y por qué debe evitarse. Cualquier lector que haya llegado aquí buscando un modelo de IA debe saber que no existe ninguno asociado a este ID.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Win64) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible como modelo; la card lista 14 códigos de idioma como etiquetas de metadatos |
| Licencia | MIT (declarada en los metadatos, sin relación con el binario distribuido) |
| Formato de pesos | no disponible; el artefacto es un ZIP con un `.exe` en su interior |

## Arquitectura y entrenamiento

No aplica. No hay transformer, MoE, SSM ni ningún otro tipo de red neuronal. No hay dataset de entrenamiento, ni tokens procesados, ni fases de RLHF/DPO. El repositorio contiene únicamente una model card en Markdown con enlaces a un ZIP alojado en GitHub (`claudio00344/elden-ring-nightreign-trainer-coop-2026`) y a un repositorio de releases (`sidorov4181/trust-wallet-metamask-seed-recovery-pc`).

El nombre del ejecutable hace referencia a un supuesto *trainer* para el juego *Elden Ring Nightreign*, lo que contradice por completo el título del repositorio (recuperación de seeds de billeteras). Esta incoherencia entre nombre, contenido y binario es un indicador fuerte de artefacto malicioso o de *scam*.

## Capacidades

- Ninguna capacidad de generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales.
- El único "comportamiento" documentado es la ejecución de un binario de Windows con privilegios de administrador.

## Casos de uso

No existen casos de uso legítimos para un modelo de IA en este repositorio. Los escenarios que la card sugiere (recuperación de frases semilla, derivación multi-cadena, auditoría de tokens ERC20/SPL) no son funcionalidades de un modelo de lenguaje y, además, apuntan a actividades de alto riesgo:

- Recuperación de frases semilla de billeteras ajenas: constituye acceso no autorizado a sistemas y podría ser delito en la mayoría de jurisdicciones.
- Derivación de direcciones BIP44/BIP84 para barrido de fondos: actividad típica de *drainers*.
- Parseo de keystores LevelDB de extensiones de navegador: técnica de extracción de credenciales locales.
- Rotación de RPC (Alchemy, Helius, QuickNode): evasión de límites y de detección.
- Ejecución de un `.exe` como administrador tras extraer un ZIP con contraseña: vector clásico de *dropper*.
- Distribución de binarios sin firma ni verificación: riesgo de *supply chain* para cualquier usuario que lo descargue.

Ninguno de estos escenarios es recomendable ni defendible técnicamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación porque no hay modelo que evaluar.

## Requisitos de hardware

- VRAM estimada: no aplica (no hay inferencia de red neuronal).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- El único requisito declarado es Windows 10/11 de 64 bits, con ejecución como administrador.
- Tamaño del artefacto: 4,8 MB (ZIP), lo que descarta que contenga pesos de un modelo real.

## Comparativa con modelos similares

No disponible. No hay modelos comparables porque este repositorio no contiene un modelo. Cualquier comparación con LLM reales (Llama, Mistral, Qwen, Gemma) sería engañosa: aquellos tienen pesos, arquitectura documentada y evaluaciones públicas; este artefacto no tiene ninguno de los tres.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no puede evaluarse con benchmarks estándar.
- Incoherencia grave entre el nombre del repositorio (recuperación de seeds), el nombre del binario (*trainer* de Elden Ring) y los tags (Windows, x64, portable).
- Distribución mediante ZIP con contraseña y ejecutable sin firma: patrón habitual de *malware* y de *droppers*.
- Ejecución solicitada con privilegios de administrador: máxima superficie de ataque sobre el sistema del usuario.
- Enlaces de descarga apuntan a repositorios de GitHub de terceros no verificados, no al propio Hugging Face.
- La licencia MIT declarada en los metadatos no otorga ninguna garantía sobre el binario ni sobre su procedencia.
- Riesgo legal: las funcionalidades descritas (recuperación de seeds ajenas, barrido de fondos, parseo de keystores) pueden constituir delito en España (art. 197 y 248 del Código Penal, entre otros) y en la UE.
- Riesgo de seguridad: instalar y ejecutar el binario puede comprometer credenciales, billeteras y el propio sistema operativo.
- No debe descargarse, extraerse ni ejecutarse bajo ninguna circunstancia.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/alfandaxdrake14/trust-wallet-metamask-seed-recovery-pc
- Repositorio de GitHub referenciado en la card (no verificado, no recomendado): https://github.com/claudio00344/elden-ring-nightreign-trainer-coop-2026
- Repositorio de releases referenciado en la card (no verificado, no recomendado): https://github.com/sidorov4181/trust-wallet-metamask-seed-recovery-pc/releases/latest
- No se han encontrado papers, blogs, demos ni documentación técnica asociados a este repositorio.
